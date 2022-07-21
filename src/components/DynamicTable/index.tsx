import { Table } from "@mantine/core";

export function DynamicTable({ elements }: any) {
  let head = [];
  for (let key in elements[0]) {
    head.push(<th key={key}>{key}</th>);
  }

  let rows = [];
  for (let value of elements) {
    let row = [];
    let i = 1;
    for (let key in value) {
      row.push(
        <td key={i}>{(value[key] || "").toString().replace(",", ", ")}</td>
      );
      i++;
    }
    rows.push(<tr key={value.phone}>{row}</tr>);
  }

  return (
    <Table highlightOnHover>
      <thead>
        <tr>{head}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </Table>
  );
}
