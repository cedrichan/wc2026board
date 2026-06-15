import { useState } from "react";
import Avatar from "@mui/material/Avatar";
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

interface GroupCardProps {
  group: GroupViewModel;
}

export default function GroupCard({ group }: GroupCardProps): JSX.Element {
  return (
    <Card
      aria-label={group.accessibleName}
      sx={{ width: { xs: "88vw", md: 320 }, flexShrink: 0 }}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600 }}>
            {group.label}
          </Typography>
          {group.live && (
            <Chip label="Live" size="small" color="error" />
          )}
        </Stack>

        <Table size="small" aria-label={`${group.label} standings`}>
          <TableHead>
            <TableRow>
              <TableCell scope="col" sx={{ p: 0.5, width: 28, textAlign: "center", fontSize: "0.7rem" }}>Pos</TableCell>
              <TableCell scope="col" sx={{ p: 0.5, fontSize: "0.7rem" }}>Team</TableCell>
              <TableCell scope="col" align="right" sx={{ p: 0.5, width: 24, fontSize: "0.7rem" }}>P</TableCell>
              <TableCell scope="col" align="right" sx={{ p: 0.5, width: 44, fontSize: "0.7rem" }}>W-D-L</TableCell>
              <TableCell scope="col" align="right" sx={{ p: 0.5, width: 32, fontSize: "0.7rem" }}>GD</TableCell>
              <TableCell scope="col" align="right" sx={{ p: 0.5, width: 28, fontSize: "0.7rem", fontWeight: 700 }}>Pts</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {group.rows.map((row) => (
              <GroupTableRow key={row.id} row={row} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function GroupTableRow({ row }: { row: GroupRowViewModel }): JSX.Element {
  const { borderColor, posIndicator } = qualificationStyle(row.qualification);
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
        <TableCell align="center" sx={{ p: 0.5, fontSize: "0.75rem" }}>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.25}>
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
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="caption"
                component="span"
                sx={{ display: { xs: "none", md: "inline" }, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {row.team.name}
              </Typography>
              <Typography
                variant="caption"
                component="span"
                sx={{ display: { xs: "inline", md: "none" } }}
              >
                {row.team.shortName}
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

function qualificationStyle(qualification: GroupRowViewModel["qualification"]): {
  borderColor: string;
  posIndicator?: string;
} {
  switch (qualification) {
    case "DIRECT":
      return { borderColor: "success.main", posIndicator: "Q" };
    case "THIRD_PLACE_QUALIFIER":
      return { borderColor: "info.main", posIndicator: "Q3" };
    case "OUTSIDE":
      return { borderColor: "transparent" };
    case "UNRESOLVED":
      return { borderColor: "warning.main", posIndicator: "?" };
  }
}

function TeamFlag({ team }: { team: TeamViewModel }): JSX.Element {
  const [imgError, setImgError] = useState(false);

  if (team.flagUrl === undefined || imgError) {
    return (
      <Avatar sx={{ width: 20, height: 20, fontSize: "0.55rem" }} aria-hidden="true">
        {team.fifaCode.slice(0, 3)}
      </Avatar>
    );
  }

  return (
    <Avatar
      src={team.flagUrl}
      alt={team.flagAlt}
      sx={{ width: 20, height: 20 }}
      imgProps={{ onError: () => setImgError(true) }}
    />
  );
}
