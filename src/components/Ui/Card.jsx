/**
 * Universal Card — AversA Design System
 *
 * Compound component: <Card>, <Card.Header>, <Card.Body>, <Card.Footer>
 *
 * @param {"default"|"raised"|"bordered"|"flat"|"ghost"|"brand"} variant
 * @param {boolean} interactive - Adds hover lift effect
 * @param {boolean} noPadding   - Removes default body padding
 */

function Card({
  variant = "default",
  interactive = false,
  noPadding = false,
  className = "",
  children,
  ...props
}) {
  const variants = {
    default:
      "bg-white border border-[#E2E8F0] shadow-[0_1px_3px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)]",
    raised:
      "bg-white border border-[#E2E8F0] shadow-[0_4px_6px_-1px_rgba(15,23,42,0.07),0_2px_4px_-1px_rgba(15,23,42,0.04)]",
    bordered:
      "bg-white border-2 border-[#E2E8F0] shadow-none",
    flat:
      "bg-[#F8FAFC] border border-[#F1F5F9] shadow-none",
    ghost:
      "bg-transparent border border-[#E2E8F0] shadow-none",
    brand:
      "bg-white border border-[#BFDBFE] shadow-[0_4px_14px_rgba(37,99,235,0.10)]",
  };

  const interactiveClass = interactive
    ? "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(15,23,42,0.10)] hover:border-[#CBD5E1]"
    : "transition-shadow duration-200";

  return (
    <div
      className={[
        "rounded-[18px]",
        variants[variant] ?? variants.default,
        interactiveClass,
        noPadding ? "" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className = "", children, ...props }) {
  return (
    <div
      className={["px-5 pt-5 pb-4 border-b border-[#F1F5F9]", className].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

function CardBody({ className = "", children, ...props }) {
  return (
    <div className={["p-5", className].join(" ")} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ className = "", children, ...props }) {
  return (
    <div
      className={["px-5 pb-5 pt-4 border-t border-[#F1F5F9]", className].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body   = CardBody;
Card.Footer = CardFooter;

export { CardHeader, CardBody, CardFooter };
export default Card;

