/**
 * Match names, team names and nicknames are typed by users and interpolated into
 * HTML mail bodies. Escaping them is the same rule as any other template: a team
 * called `<script>` or one with a stray quote must arrive as those characters,
 * not as markup. Mail clients strip scripts, but unescaped input still breaks the
 * layout and hands a sender the ability to inject their own links.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
