/**
 * filter for all links
 * @param {*} param0 
 */
function allLinksBuildFilter({OR = [], description_contains, url_contains}) {
  const filter = (description_contains || url_contains) ? {} : null;
  if (description_contains) {
    filter.description = {$regex: `.*${description_contains}.*`};
  }
  if (url_contains) {
    filter.url = {$regex: `.*${url_contains}.*`};
  }

  let filters = filter ? [filter] : [];
  // they iterate this since the structure is array and we basically don't  know that  would be the key name of those arrays.
  /**
   * OR: [
   *   {url_contains: "url"},
   *   {description_contains: "description"},
   * ]
   */
  for (let i = 0; i < OR.length; i++) {
    filters = filters.concat(allLinksBuildFilter(OR[i]));
  }

  return filters;
}

module.exports = {
  allLinksBuildFilter
}