import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { ThirdPlaceRowViewModel, ThirdPlaceTableViewModel, TeamViewModel } from "../view-models/dashboard";

interface ThirdPlaceTableProps {
  thirdPlace: ThirdPlaceTableViewModel;
}

export default function ThirdPlaceTable({ thirdPlace }: ThirdPlaceTableProps): JSX.Element {
  return (
    <Paper variant="outlined" aria-label={thirdPlace.accessibleName}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
        <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 600 }}>
          {thirdPlace.label}
        </Typography>
        {!thirdPlace.boundaryResolved && (
          <Typography variant="caption" color="warning.main" sx={{ fontStyle: "italic" }}>
            Qualification boundary unresolved
          </Typography>
        )}
      </Stack>

      <Box sx={{ overflowX: "auto" }}>
        <Table size="small" aria-label="Third-place team rankings">
          <TableHead>
            <TableRow>
              <TableCell scope="col" sx={headerCellSx}>Rank</TableCell>
              <TableCell scope="col" sx={headerCellSx}>Group</TableCell>
              <TableCell scope="col" sx={headerCellSx}>Team</TableCell>
              <TableCell scope="col" align="right" sx={headerCellSx}>P</TableCell>
              <TableCell scope="col" align="right" sx={headerCellSx}>GD</TableCell>
              <TableCell scope="col" align="right" sx={headerCellSx}>GF</TableCell>
              <TableCell scope="col" align="right" sx={{ ...headerCellSx, display: { xs: "none", sm: "table-cell" } }}>Conduct</TableCell>
              <TableCell scope="col" sx={headerCellSx}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {thirdPlace.rows.map((row) => (
              <ThirdPlaceRow key={row.id} row={row} />
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}

const headerCellSx = { fontSize: "0.7rem", fontWeight: 600, py: 0.5, px: 1 };
const dataCellSx = { fontSize: "0.75rem", py: 0.5, px: 1 };

function ThirdPlaceRow({ row }: { row: ThirdPlaceRowViewModel }): JSX.Element {
  const isQualifying = row.qualifying === true;
  const isOutside = row.qualifying === false;

  const statusColor = isQualifying ? "success.main" : isOutside ? "text.secondary" : "warning.main";

  return (
    <>
      <TableRow
        aria-label={row.accessibleName}
        sx={{
          "& td": { borderBottom: row.qualificationLineAfter ? "none" : undefined },
          bgcolor: isQualifying ? "action.hover" : "transparent",
        }}
      >
        <TableCell sx={dataCellSx}>{row.rank}</TableCell>
        <TableCell sx={dataCellSx}>{row.groupId}</TableCell>
        <TableCell sx={dataCellSx}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <TeamFlag team={row.team} />
            <Typography
              variant="caption"
              sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}
            >
              {row.team.shortName}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell align="right" sx={dataCellSx}>{row.played}</TableCell>
        <TableCell align="right" sx={dataCellSx}>{row.goalDifferenceLabel}</TableCell>
        <TableCell align="right" sx={dataCellSx}>{row.goalsFor}</TableCell>
        <TableCell
          align="right"
          sx={{ ...dataCellSx, display: { xs: "none", sm: "table-cell" } }}
        >
          {row.conductLabel}
        </TableCell>
        <TableCell sx={dataCellSx}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography
              variant="caption"
              sx={{ color: statusColor, fontWeight: isQualifying ? 600 : 400, fontStyle: row.provisional ? "italic" : "normal" }}
            >
              {row.statusLabel}
            </Typography>
            {row.tiebreakerLabel !== undefined && (
              <Tooltip title={`Ordered by: ${row.tiebreakerLabel}`} arrow>
                <InfoOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} aria-label={`Tiebreaker: ${row.tiebreakerLabel}`} />
              </Tooltip>
            )}
          </Stack>
        </TableCell>
      </TableRow>

      {row.qualificationLineAfter && (
        <TableRow aria-hidden="true">
          <TableCell
            colSpan={8}
            sx={{
              p: 0,
              borderBottom: "2px solid",
              borderColor: "text.primary",
            }}
          />
        </TableRow>
      )}
    </>
  );
}

function TeamFlag({ team }: { team: TeamViewModel }): JSX.Element {
  const [imgError, setImgError] = useState(false);

  if (team.flagUrl === undefined || imgError) {
    return (
      <Avatar sx={{ width: 18, height: 18, fontSize: "0.5rem" }} aria-hidden="true">
        {team.fifaCode.slice(0, 3)}
      </Avatar>
    );
  }

  return (
    <Avatar
      src={team.flagUrl}
      alt={team.flagAlt}
      sx={{ width: 18, height: 18 }}
      imgProps={{ onError: () => setImgError(true) }}
    />
  );
}
