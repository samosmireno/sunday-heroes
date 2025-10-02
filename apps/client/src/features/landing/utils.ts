export const constructFullPath = (location?: Location | null) => {
  if (!location) return "/dashboard";

  let fullPath = location.pathname || "/dashboard";

  if (location.search) {
    fullPath += location.search;
  }

  if (location.hash) {
    fullPath += location.hash;
  }

  return fullPath;
};
