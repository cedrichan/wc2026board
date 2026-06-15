import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import type { GroupRowViewModel, GroupViewModel, TeamViewModel } from "../view-models/dashboard";
import { VIEW_SYMBOLS } from "./view-symbols";

interface GroupCardProps {
  group: GroupViewModel;
}

export default function GroupCard({ group }: GroupCardProps): JSX.Element {
  return (
    <Card
      aria-label={group.accessibleName}
      sx={{ flex: "1 1 280px", maxWidth: 360 }}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600 }}>
            {group.label}
          </Typography>
          {group.live && (
            <Chip label={VIEW_SYMBOLS.liveChip.value} size="small" color="error" />
          )}
        </Stack>

        <Table size="small" aria-label={`${group.label} standings`}>
          <TableHead>
            <TableRow>
              <TableCell scope="col" sx={{ p: 0.5, width: 28, fontSize: "0.7rem" }}>Pos</TableCell>
              <TableCell scope="col" sx={{ p: 0.5, fontSize: "0.7rem" }}>Team</TableCell>
              <TableCell scope="col" align="right" sx={{ p: 0.5, width: 24, fontSize: "0.7rem" }}>P</TableCell>
              <TableCell scope="col" align="right" sx={{ p: 0.5, width: 44, fontSize: "0.7rem" }}>W-D-L</TableCell>
              <TableCell scope="col" align="right" sx={{ p: 0.5, width: 32, fontSize: "0.7rem" }}>GD</TableCell>
              <TableCell scope="col" align="right" sx={{ p: 0.5, width: 28, fontSize: "0.7rem", fontWeight: 700 }}>Pts</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {group.rows.map((row) => (
              <GroupTableRow key={row.id} row={row} groupComplete={group.complete} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function GroupTableRow({ row, groupComplete }: { row: GroupRowViewModel; groupComplete: boolean }): JSX.Element {
  const { borderColor, posIndicator } = qualificationStyle(row.qualification, groupComplete);
  const tooltipTitle = `GF: ${row.goalsFor}, GA: ${row.goalsAgainst}${row.explanation !== undefined ? ` · ${row.explanation}` : ""}`;

  return (
    <Tooltip title={tooltipTitle} placement="right" arrow>
      <TableRow
        aria-label={row.accessibleName}
        sx={{
          fontStyle: row.provisional ? "italic" : "normal",
          borderLeft: "3px solid",
          borderColor,
          "& td": { borderBottom: "none" },
        }}
      >
        <TableCell sx={{ p: 0.5, fontSize: "0.75rem" }}>
          <Stack direction="row" alignItems="center" spacing={0.25}>
            <span>{row.position}</span>
            {posIndicator !== undefined && (
              <Typography
                component="span"
                variant="caption"
                sx={{ fontSize: "0.6rem", fontWeight: 700, lineHeight: 1 }}
                aria-label={row.qualificationLabel}
              >
                {posIndicator}
              </Typography>
            )}
          </Stack>
        </TableCell>

        <TableCell sx={{ p: 0.5 }}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <TeamFlag team={row.team} />
            <Box sx={{ minWidth: 0, maxWidth: "100px" }}>
              <Typography
                variant="caption"
                component="span"
                sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}
              >
                {row.team.name}
              </Typography>
            </Box>
          </Stack>
        </TableCell>

        <TableCell align="right" sx={{ p: 0.5, fontSize: "0.75rem" }}>{row.played}</TableCell>
        <TableCell align="right" sx={{ p: 0.5, fontSize: "0.7rem" }}>{row.recordLabel}</TableCell>
        <TableCell align="right" sx={{ p: 0.5, fontSize: "0.75rem" }}>{row.goalDifferenceLabel}</TableCell>
        <TableCell align="right" sx={{ p: 0.5, fontSize: "0.75rem", fontWeight: 700 }}>{row.points}</TableCell>
      </TableRow>
    </Tooltip>
  );
}

function qualificationStyle(qualification: GroupRowViewModel["qualification"], groupComplete: boolean): {
  borderColor: string;
  posIndicator?: string;
} {
  switch (qualification) {
    case "DIRECT":
      return { borderColor: "success.main", posIndicator: groupComplete ? VIEW_SYMBOLS.groupQualificationIndicators.DIRECT.value : undefined };
    case "THIRD_PLACE_QUALIFIER":
      return { borderColor: "info.main", posIndicator: groupComplete ? VIEW_SYMBOLS.groupQualificationIndicators.THIRD_PLACE_QUALIFIER.value : undefined };
    case "OUTSIDE":
      return { borderColor: "transparent" };
    case "UNRESOLVED":
      return { borderColor: "warning.main", posIndicator: VIEW_SYMBOLS.groupQualificationIndicators.UNRESOLVED.value };
  }
}

function TeamFlag({ team }: { team: TeamViewModel }): JSX.Element {
  return (
    <Box
      component="span"
      sx={{ width: 20, height: 20, fontSize: "0.8rem", display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
      aria-label={team.flagAlt}
      role="img"
    >
      {team.flagEmoji}
    </Box>
  );
}
