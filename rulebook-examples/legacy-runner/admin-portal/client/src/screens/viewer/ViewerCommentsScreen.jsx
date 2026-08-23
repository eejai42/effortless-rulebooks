import ScreenHeader from "../../components/ScreenHeader.jsx";

export default function ViewerCommentsScreen({ screen }) {
  return (
    <>
      <ScreenHeader screen={screen} />
      <div className="story-banner">
        Review comments live here. Coming soon: attach comments to entities, test cases, and substrate
        runs from a viewer/reviewer perspective.
      </div>
      <p className="muted small">
        For now the conformance matrix (under Tests) shows pass/fail with substrate-level detail.
      </p>
    </>
  );
}
