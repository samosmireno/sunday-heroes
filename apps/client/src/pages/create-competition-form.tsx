export default function CreateCompetitionForm() {
  const searchParams = new URLSearchParams(window.location.search);
  const dashboardId = searchParams.get("dashboardId");
  return <div>{dashboardId}</div>;
}
