import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

/**
 * Compact rules and data-source disclosure (page section 5).
 *
 * Copy is intentionally brief and explains, per the PRD: projections are
 * computed locally and are not official, uncertain placements are labeled,
 * ESPN is the sole data source with no automatic fallback, and stale data is
 * labeled when ESPN is unreachable.
 */
export default function RulesDisclosure(): JSX.Element {
  return (
    <Box
      component="section"
      aria-label="Rules and data source disclosure"
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
        px: 2,
        py: 1.25,
      }}
    >
      <Typography variant="caption" color="text.secondary" component="p" sx={{ m: 0 }}>
        Projected standings, third-place ranking, and bracket are calculated
        locally from live ESPN scores using FIFA rules — not official results.
        Uncertain placements are marked Provisional/Unresolved. ESPN is the only
        data source; there is no automatic fallback. Stale data is labeled when
        ESPN can&rsquo;t be reached.
      </Typography>
    </Box>
  );
}
