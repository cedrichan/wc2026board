import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

const ROUND_COUNTS = [16, 8, 4, 2, 1, 1];
const CARD_WIDTH = 200;
const CARD_HEIGHT = 112;

export default function BracketSkeleton(): JSX.Element {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: 3,
        overflowX: "auto",
        pb: 1,
      }}
      aria-busy="true"
      aria-label="Loading bracket"
    >
      {ROUND_COUNTS.map((count, roundIndex) => (
        <Stack key={roundIndex} spacing={1} sx={{ flexShrink: 0 }}>
          <Skeleton variant="text" width={80} height={20} sx={{ mb: 0.5 }} />
          <Stack spacing={1}>
            {Array.from({ length: count }, (_, i) => (
              <MatchCardSkeleton key={i} />
            ))}
          </Stack>
        </Stack>
      ))}
    </Box>
  );
}

function MatchCardSkeleton(): JSX.Element {
  return (
    <Card sx={{ width: CARD_WIDTH, height: CARD_HEIGHT, flexShrink: 0 }}>
      <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
        <Stack spacing={0.75}>
          <Stack direction="row" justifyContent="space-between">
            <Skeleton variant="text" width={30} height={16} />
            <Skeleton variant="rounded" width={50} height={16} />
          </Stack>
          <Skeleton variant="text" width={120} height={14} />
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" width={80} height={16} />
            <Box sx={{ flex: 1 }} />
            <Skeleton variant="text" width={16} height={16} />
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" width={80} height={16} />
            <Box sx={{ flex: 1 }} />
            <Skeleton variant="text" width={16} height={16} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
