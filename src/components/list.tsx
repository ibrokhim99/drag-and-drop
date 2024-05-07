import { Item, Status } from "@/data";
import ListItem from "./list-item";
import Indicator from "./indicator";

interface ListProps {
  status: Status;
  items: Item[];
  setActiveItem: (item: Item) => void;
}

export default function List({ items, status, setActiveItem }: ListProps) {
  return (
    <div
      data-element="container"
      data-status={status}
      className="w-full bg-white border rounded-lg border-gray-300 py-2"
    >
      <div className="w-full px-4 py-2 border-b border-gray-300">
        <span className="text-black font-bold">{status}</span>
      </div>
      <div className="flex flex-col">
        {items.map((item) => (
          <ListItem key={item.id} item={item} setActiveItem={setActiveItem} />
        ))}
        <Indicator id={-1} />
      </div>
    </div>
  );
}
