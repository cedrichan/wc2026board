import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

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
          with FIFA or ESPN. See official{" "}
          <Link
            href="https://digitalhub.fifa.com/m/636f5c9c6f29771f/original/FWC2026_regulations_EN.pdf"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            underline="always"
          >
            rules
          </Link>{" "}
          and{" "}
          <Link
            href="https://inside.fifa.com/fifa-world-ranking/men"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            underline="always"
          >
            rankings
          </Link>
          .
        </Typography>
      </Container>
    </Box>
  );
}
