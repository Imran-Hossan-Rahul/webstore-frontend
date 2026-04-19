export const getVisitorId = () => {
  let visitorId = localStorage.getItem("visitorId");
  if (!visitorId) {
    visitorId = "visitor_" + Math.random().toString(36).substring(2);
    localStorage.setItem("visitorId", visitorId);
  }
  return visitorId;
};
