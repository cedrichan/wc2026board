# Project Documentation

Before making changes, review the relevant project requirements:

- `docs/product.md` defines the product scope, behavior, and requirements.
- `docs/frontend.md` defines the frontend architecture, implementation constraints,
  and UI requirements.

# Backlog Task Workflow

When a backlog task is complete, move its file from `docs/backlog/` to
`docs/backlog/completed/` and commit that move alongside (or immediately after)
the implementation commit.

# Backlog Task Ambiguities

When a backlog task is ambiguous or leaves a product or implementation decision
unspecified:

- Ask the user to resolve the ambiguity instead of making the decision
  independently.
- Provide concise suggestions or recommendations, including relevant tradeoffs.
- Do not implement a suggested or recommended resolution until the user has
  explicitly approved it.
