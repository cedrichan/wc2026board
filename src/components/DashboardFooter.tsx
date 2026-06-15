import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

/**
 * Page footer (page section 6). Brief rights/attribution language approved for
 * release; intentionally free of external links until any are approved.
 */
export default function DashboardFooter(): JSX.Element {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: { xs: 1, sm: 2, md: 3 },
        bgcolor: "primary.dark",
        color: "primary.contrastText",
        mt: "auto",
      }}
    >
      <Container maxWidth={false}>
        <Typography variant="body2" align="center">
          Unofficial World Cup 2026 dashboard. Data from ESPN. Not affiliated
          with FIFA or ESPN.
        </Typography>
      </Container>
    </Box>
  );
}
