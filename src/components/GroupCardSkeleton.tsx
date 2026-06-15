import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const GROUP_IDS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"] as const;

export default function GroupCardStripSkeleton(): JSX.Element {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: 2,
        overflowX: "auto",
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
        pb: 1,
      }}
      aria-busy="true"
      aria-label="Loading group tables"
    >
      {GROUP_IDS.map((id) => (
        <GroupCardSkeleton key={id} groupId={id} />
      ))}
    </Box>
  );
}

function GroupCardSkeleton({ groupId }: { groupId: string }): JSX.Element {
  return (
    <Card
      sx={{
        width: { xs: "88vw", md: 320 },
        flexShrink: 0,
        scrollSnapAlign: "start",
      }}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: "text.disabled" }}>
          Group {groupId}
        </Typography>
        <Stack spacing={0.75}>
          {Array.from({ length: 4 }, (_, i) => (
            <Stack key={i} direction="row" alignItems="center" spacing={0.75}>
              <Skeleton variant="circular" width={20} height={20} />
              <Skeleton variant="text" width={100} height={16} />
              <Box sx={{ flex: 1 }} />
              <Skeleton variant="text" width={40} height={16} />
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
