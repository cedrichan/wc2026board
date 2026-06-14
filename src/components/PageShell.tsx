import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";

export default function PageShell() {
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      {/* 1. Application header and data status */}
      <AppBar position="sticky" component="header">
        <Toolbar>
          <Typography
            variant="h6"
            component="h1"
            sx={{ fontWeight: 700, letterSpacing: 0.5 }}
          >
            World Cup 2026
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flex: 1 }}>
        <Container
          maxWidth={false}
          sx={{ px: { xs: 1, sm: 2, md: 3 }, py: 2 }}
        >
          {/* 2. Knockout bracket */}
          <Box
            component="section"
            aria-label="Knockout bracket"
            sx={{ mb: 3 }}
          >
            <Typography
              variant="h5"
              component="h2"
              sx={{ mb: 1, color: "text.secondary", fontWeight: 600 }}
            >
              Knockout Bracket
            </Typography>
            <Box
              sx={{
                minHeight: 200,
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.paper",
              }}
            >
              <Typography color="text.disabled">
                Bracket placeholder (B005+)
              </Typography>
            </Box>
          </Box>

          {/* 3. Best third-place ranking */}
          <Box
            component="section"
            aria-label="Best third-place ranking"
            sx={{ mb: 3 }}
          >
            <Typography
              variant="h5"
              component="h2"
              sx={{ mb: 1, color: "text.secondary", fontWeight: 600 }}
            >
              Best Third-Place Teams
            </Typography>
            <Box
              sx={{
                minHeight: 120,
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.paper",
              }}
            >
              <Typography color="text.disabled">
                Third-place table placeholder (B015+)
              </Typography>
            </Box>
          </Box>

          {/* 4. Horizontally scrolling group tables */}
          <Box
            component="section"
            aria-label="Group tables"
            sx={{ mb: 3 }}
          >
            <Typography
              variant="h5"
              component="h2"
              sx={{ mb: 1, color: "text.secondary", fontWeight: 600 }}
            >
              Group Tables
            </Typography>
            <Box
              tabIndex={0}
              role="region"
              aria-label="Group tables, scrollable"
              sx={{
                overflowX: "auto",
                scrollSnapType: "x mandatory",
                WebkitOverflowScrolling: "touch",
                outline: "none",
                "&:focus-visible": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: "2px",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  pb: 1,
                  minHeight: 160,
                }}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <Box
                    key={i}
                    sx={{
                      minWidth: 300,
                      flexShrink: 0,
                      scrollSnapAlign: "start",
                      border: "1px dashed",
                      borderColor: "divider",
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "background.paper",
                    }}
                  >
                    <Typography color="text.disabled">
                      Group{" "}
                      {String.fromCharCode(65 + i)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* 5. Rules and data-source disclosure */}
          <Box
            component="section"
            aria-label="Rules and data source disclosure"
            sx={{ mb: 3 }}
          >
            <Box
              sx={{
                minHeight: 60,
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.paper",
                px: 2,
                py: 1,
              }}
            >
              <Typography variant="body2" color="text.disabled">
                Disclosure placeholder — qualification rules and data-source
                attribution (B003 follow-up)
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 6. Footer */}
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
            Data sourced from ESPN. Not affiliated with FIFA.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
