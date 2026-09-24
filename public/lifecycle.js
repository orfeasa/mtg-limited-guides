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
          && set.earlyEvidence.byCard[card.id]?.grades.some(grade => grade.sourceId === card.reviewSourceId && String(grade.grade) === card.reviewGrade);
      });
    const training = ratings || Boolean(reviewTraining);
    const memory = complete && set.cards.length > 2 && set.cards.every((card) => typeof card.oracleText === "string");
    const archetypes = complete && Boolean(set.archetypes?.archetypes?.length);
    const prep = complete && set.prep?.status === "published" && reached(set.prep.publishedAt);
    const decisions = ratings && Boolean(set.draftDecisions?.scenarios?.length);
    return {
      complete, released, training, ratings, reviewTraining: Boolean(reviewTraining), memory, prep, archetypes, decisions,
      stage: ratings ? "observed" : complete ? "complete" : "preview",
      atlasLabel: complete ? "All cards" : "Previews",
      defaultView: training ? "training" : "atlas",
      views: [training && "training", memory && "memory", prep && "prep", archetypes && "archetypes", decisions && "decisions", "atlas"].filter(Boolean),
    };
  }
  window.SET_LIFECYCLE = { resolve };
})();
