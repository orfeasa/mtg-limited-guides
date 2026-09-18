/* Shared lifecycle policy. Dates use UTC calendar days; evidence gates stay explicit. */
(() => {
  function resolve(set, today = new Date().toISOString().slice(0, 10)) {
    const reached = (date) => Boolean(date && date <= today);
    const complete = reached(set.lifecycle?.fullSetConfirmedAt);
    const released = reached(set.releaseDate);
    const training = complete && reached(set.lifecycle?.ratingsConfirmedAt)
      && set.rating?.status === "available" && Boolean(set.rating.source && set.rating.url && set.rating.capturedAt)
      && set.cards.length > 0 && set.cards.every((card) => Number.isFinite(card.rank) && Boolean(card.tier));
    const archetypes = complete && Boolean(set.archetypes?.archetypes?.length);
    const decisions = training && Boolean(set.draftDecisions?.scenarios?.length);
    return {
      complete, released, training, archetypes, decisions,
      stage: training ? "observed" : complete ? "complete" : "preview",
      atlasLabel: complete ? "All cards" : "Previews",
      defaultView: training ? "training" : archetypes ? "archetypes" : "atlas",
      views: [training && "training", archetypes && "archetypes", decisions && "decisions", "atlas"].filter(Boolean),
    };
  }
  window.SET_LIFECYCLE = { resolve };
})();
