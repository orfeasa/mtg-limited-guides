/* Shared lifecycle policy. Dates use UTC calendar days; evidence gates stay explicit. */
(() => {
  function resolve(set, today = new Date().toISOString().slice(0, 10)) {
    const reached = (date) => Boolean(date && date <= today);
    const complete = reached(set.lifecycle?.fullSetConfirmedAt);
    const released = reached(set.releaseDate);
    const ratings = complete && reached(set.lifecycle?.ratingsConfirmedAt)
      && set.rating?.status === "available" && Boolean(set.rating.source && set.rating.url && set.rating.capturedAt)
      && set.cards.length > 0 && set.cards.every((card) => Number.isFinite(card.rank) && Boolean(card.tier));
    const review = set.reviewTraining;
    const cohort = set.cards.filter(card => !card.isBasicLand);
    const reviewTraining = complete && review?.status === 'available' && reached(review.confirmedAt)
      && Boolean(review.author && review.url && review.capturedAt && review.reviewerGroup)
      && cohort.length > 0 && cohort.every(card => {
        const source = set.earlyEvidence?.sources?.[card.reviewSourceId];
        return review.options?.some(option => option.value === card.reviewGrade)
          && source?.dependencyGroup === review.reviewerGroup
          && source.author === review.author && source.capturedAt === review.capturedAt
          && source.scale?.min === 0 && source.scale?.max === 5
          && set.earlyEvidence.byCard[card.id]?.grades.some(grade => grade.sourceId === card.reviewSourceId && String(grade.grade) === card.reviewGrade);
      });
    const tierBrowser = complete && reached(set.observedRatings?.capturedAt?.slice(0, 10)) && Boolean(set.observedRatings?.source && set.observedRatings?.url) && set.cards.some(card => card.tier && Number.isFinite(card.rank));
    const observedCohort = cohort.filter(card => card.tier !== null && card.tier !== undefined);
    const observedTraining = ratings || (tierBrowser && set.observedTraining?.scope === "rated-cards"
      && reached(set.observedTraining.confirmedAt)
      && observedCohort.length === set.observedRatings.ratedCards
      && observedCohort.length > 0
      && observedCohort.every(card => /^(S|[ABCD][+-]?|F)$/.test(card.tier) && Number.isInteger(card.rank) && card.stats?.inHandGames > 0));
    const training = observedTraining || Boolean(reviewTraining);
    const memory = set.cardMemory !== false && complete && set.cards.length > 2 && set.cards.every((card) => typeof card.oracleText === "string");
    const archetypes = complete && Boolean(set.archetypes?.archetypes?.length);
    const prep = complete && set.prep?.status === "published" && reached(set.prep.publishedAt);
    const decisions = ratings && Boolean(set.draftDecisions?.scenarios?.length);
    return {
      complete, released, training, ratings, observedTraining, tierBrowser: ratings || tierBrowser, reviewTraining: Boolean(reviewTraining), memory, prep, archetypes, decisions,
      stage: ratings ? "observed" : complete ? "complete" : "preview",
      atlasLabel: complete ? "All cards" : "Previews",
      defaultView: training ? "training" : "atlas",
      views: [training && "training", memory && "memory", prep && "prep", archetypes && "archetypes", decisions && "decisions", "atlas"].filter(Boolean),
    };
  }
  window.SET_LIFECYCLE = { resolve };
})();
