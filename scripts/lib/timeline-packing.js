// Row packing for the timeline: bars that overlap in time go on separate rows,
// and a group — a host with what it carried underneath — takes a block of rows
// that nothing else may cross. Months are whole numbers; a bar covers its last
// month, so two bars share a row only when one starts after the other's end.

// Greedy: each bar takes the first row free when it starts. Rows from 0.
function packRows(bars) {
  const rowEnds = [];
  return [...bars]
    .sort((a, b) => a.start - b.start)
    .map((bar) => {
      let row = rowEnds.findIndex((end) => end < bar.start);
      if (row === -1) row = rowEnds.length;
      rowEnds[row] = bar.end;
      return { ...bar, row };
    });
}

// Each group ({ start, end, height }) takes the first block of `height` rows
// free over its whole span. Returns them with their top row, and the rows used.
function packGroups(groups) {
  const rowEnds = [];
  const free = (row, group) => rowEnds[row] === undefined || rowEnds[row] < group.start;
  const fits = (top, group) =>
    Array.from({ length: group.height }, (_, i) => top + i).every((row) => free(row, group));
  const placed = [...groups]
    .sort((a, b) => a.start - b.start)
    .map((group) => {
      let top = 0;
      while (!fits(top, group)) top += 1;
      for (let i = 0; i < group.height; i += 1) rowEnds[top + i] = group.end;
      return { ...group, row: top };
    });
  return { groups: placed, rows: rowEnds.length };
}

module.exports = { packRows, packGroups };
