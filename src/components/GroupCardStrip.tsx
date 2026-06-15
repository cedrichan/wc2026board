import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import GroupCard from "./GroupCard";
import type { GroupViewModel } from "../view-models/dashboard";

const GROUP_IDS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"] as const;

interface GroupCardStripProps {
  groups: readonly GroupViewModel[];
}

export default function GroupCardStrip({ groups }: GroupCardStripProps): JSX.Element {
  const groupsById = new Map(groups.map((g) => [g.groupId, g]));

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      {GROUP_IDS.map((id) => {
        const group = groupsById.get(id);
        if (group !== undefined) {
          return <GroupCard key={id} group={group} />;
        }
        return <GroupPlaceholder key={id} groupId={id} />;
      })}
    </Box>
  );
}

function GroupPlaceholder({ groupId }: { groupId: string }): JSX.Element {
  return (
    <Card
      sx={{ flex: "1 1 280px", maxWidth: 360 }}
      aria-label={`Group ${groupId} — data unavailable`}
    >
      <CardContent
        sx={{
          p: 1.5,
          "&:last-child": { pb: 1.5 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 120,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.secondary" }}>
          Group {groupId}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Data unavailable
        </Typography>
      </CardContent>
    </Card>
  );
}
