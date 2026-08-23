export default function ScreenHeader({ screen, children }) {
  if (!screen) return null;
  return (
    <div className="screen-header">
      <h2 className="h1">{screen.Title}</h2>
      {screen.Story && <div className="story-banner">{screen.Story}</div>}
      {children}
    </div>
  );
}
