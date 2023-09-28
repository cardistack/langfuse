import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { DatePicker } from "@/src/components/date-picker";
import { type Dispatch, type SetStateAction, useState } from "react";
import { Filter, Plus, Trash } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

type dtype = "string" | "number" | "datetime";

export type Column = { name: string; type: dtype };
export type Columns = readonly Column[];

type ColumnNames<C extends Columns> = C[number]["name"];

const operators = {
  string: ["=", "!=", "starts with", "ends with", "contains", "regex"],
  number: ["=", "!=", ">", "<"],
  datetime: [">", "<"],
} as const;

type Filter<cols extends Columns = []> = {
  column: ColumnNames<cols> | null;
  operator: (typeof operators)[cols[number]["type"]][number] | null;
  value: string | null;
};
type FilterState<cols extends Columns = []> = Filter<cols>[];

type FilterBuilderProps<cols extends Columns = []> = {
  columns: cols;
  filterState: FilterState<cols>;
  onChange: Dispatch<SetStateAction<FilterState<cols>>>;
};

function isValidFilter<T extends Columns = []>(filter: Filter<T>) {
  return (
    filter.column !== null &&
    filter.operator !== null &&
    filter.value !== null &&
    filter.value !== ""
  );
}

export function FilterBuilder<T extends Columns>({
  columns,
  filterState,
  onChange,
}: FilterBuilderProps<T>) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Filter className="mr-3 h-4 w-4" />
          <span>Filter</span>
          {filterState.length > 0
            ? filterState
                .filter((f) => isValidFilter(f))
                .map((filter, i) => {
                  const colDtype = columns.find((c) => c.name === filter.column)
                    ?.type;

                  return (
                    <span
                      key={i}
                      className="ml-3 rounded-md bg-slate-200 p-1 px-2 text-xs"
                    >
                      {filter.column} {filter.operator}{" "}
                      {filter.value
                        ? colDtype === "datetime"
                          ? new Date(filter.value).toLocaleDateString()
                          : `"${filter.value}"`
                        : null}
                    </span>
                  );
                })
            : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit">
        <FilterBuilderForm
          columns={columns}
          filterState={filterState}
          onChange={onChange}
        />
      </PopoverContent>
    </Popover>
  );
}

function FilterBuilderForm<T extends Columns>({
  columns,
  filterState,
  onChange,
}: FilterBuilderProps<T>) {
  const handleFilterChange = (filter: Filter<T>, i: number) => {
    onChange((prev) => {
      const newState = [...prev];
      newState[i] = filter;
      return newState;
    });
  };

  const addNewFilter = () => {
    onChange((prev) => [
      ...prev,
      { column: null, operator: null, value: null },
    ]);
  };

  const removeFilter = (i: number) => {
    onChange((prev) => {
      const newState = [...prev];
      newState.splice(i, 1);
      return newState;
    });
  };

  return (
    <>
      <table className="table-auto">
        <tbody>
          {filterState.map((filter, i) => {
            const colDtype = columns.find((c) => c.name === filter.column)
              ?.type;
            return (
              <tr key={i}>
                <td className="p-2">{i === 0 ? "Where" : "And"}</td>
                <td className="p-2">
                  <Select
                    value={filter.column ?? ""}
                    onValueChange={(value) =>
                      handleFilterChange(
                        {
                          ...filter,
                          column: value as typeof filter.column,
                          operator: null,
                          value: null,
                        },
                        i,
                      )
                    }
                  >
                    <SelectTrigger className="min-w-[100px]">
                      <SelectValue placeholder="Column" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((option) => (
                        <SelectItem key={option.name} value={option.name}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2">
                  <Select
                    disabled={!filter.column}
                    onValueChange={(value) =>
                      handleFilterChange(
                        {
                          ...filter,
                          operator: value as typeof filter.operator,
                        },
                        i,
                      )
                    }
                    value={filter.operator ?? ""}
                  >
                    <SelectTrigger className="min-w-[100px]">
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {colDtype
                        ? operators[colDtype].map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))
                        : null}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2">
                  {colDtype === "datetime" ? (
                    <DatePicker
                      className="min-w-[100px]"
                      date={filter.value ? new Date(filter.value) : undefined}
                      onChange={(date) => {
                        handleFilterChange(
                          {
                            ...filter,
                            value: date ? date.toISOString() : null,
                          },
                          i,
                        );
                      }}
                    />
                  ) : (
                    <Input
                      disabled={!filter.operator}
                      value={filter.value ?? ""}
                      className="min-w-[100px]"
                      onChange={(e) =>
                        handleFilterChange(
                          { ...filter, value: e.target.value },
                          i,
                        )
                      }
                    />
                  )}
                </td>
                <td>
                  <Button onClick={() => removeFilter(i)} variant="ghost">
                    <Trash className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Button
        onClick={() => addNewFilter()}
        className="mt-2"
        variant="ghost"
        size="sm"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add filter
      </Button>
    </>
  );
}

// manage state with hook
export const useFilterState = <cols extends Columns>(
  columns: cols,
  initialState: FilterState<cols> = [],
) => {
  // TODO: switch to query params
  const [filterState, setFilterState] = useState(initialState);

  return [filterState, setFilterState] as const;
};