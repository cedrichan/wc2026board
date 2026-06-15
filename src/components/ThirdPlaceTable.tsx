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
import type { ThirdPlaceRowViewModel, ThirdPlaceTableViewModel, TeamViewModel } from "../view-models/dashboard";
import { VIEW_ICONS, VIEW_SYMBOLS } from "./view-symbols";

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
            {VIEW_SYMBOLS.qualificationBoundaryUnresolved.value}
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
  const InfoOutlinedIcon = VIEW_ICONS.info.value;

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
  return (
    <Box
      component="span"
      sx={{ width: 18, height: 18, fontSize: "0.7rem", display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
      aria-label={team.flagAlt}
      role="img"
    >
      {team.flagEmoji}
    </Box>
  );
}
