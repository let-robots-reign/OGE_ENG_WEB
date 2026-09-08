type FeedbackNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: FeedbackNode[];
};

const allowedElements = new Set([
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "strong",
  "em",
  "del",
  "ul",
  "ol",
  "li",
  "blockquote",
  "hr",
  "br",
  "pre",
  "code",
  "span",
]);

// Runs AFTER rehypeRaw has parsed both generated markers and persisted HTML.
// Nothing executable, navigable, embedded, styled, or event-bearing survives.
// This also protects historical/client-written feedback, not only new reports.
export function rehypeSafeFeedback() {
  return (tree: FeedbackNode) => {
    const clean = (node: FeedbackNode) => {
      node.children = node.children?.filter((child) => {
        if (child.type === "text") return true;
        if (
          child.type !== "element" ||
          !allowedElements.has(child.tagName ?? "")
        )
          return false;
        const classes = child.properties?.className;
        child.properties =
          child.tagName === "span" && Array.isArray(classes)
            ? {
                className: classes.filter(
                  (value) => value === "fb-correct" || value === "fb-incorrect",
                ),
              }
            : {};
        clean(child);
        return true;
      });
    };
    clean(tree);
  };
}
