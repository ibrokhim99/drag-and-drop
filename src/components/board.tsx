import { Item, Status } from "@/data";
import { useRef, useState } from "react";
import List from "./list";

type BoardProps = {
  items: Item[];
  setItems: (items: Item[]) => void;
};

export default function Board({ items, setItems }: BoardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lastContainer = useRef<HTMLDivElement | null>(null);
  const lastClientY = useRef<number>(0);

  const [activeItem, setActiveItem] = useState<Item | null>(null);

  const handleContainerLeave = (container: HTMLDivElement) => {
    if (lastContainer.current === null) {
      lastContainer.current = container;
    }
    if (lastContainer.current === container) return;

    const indicators = getIndicators(lastContainer.current);

    clearIndicators(indicators);
    lastContainer.current = container;
  };

  const getActiveContainer = (target: HTMLElement | null) => {
    const containers = Array.from(
      document.querySelectorAll("[data-element='container']")
    ) as HTMLDivElement[];

    let activeContainer: HTMLDivElement | undefined;
    containers.forEach((container) => {
      if (container.contains(target)) {
        handleContainerLeave(container);
        activeContainer = container;
      }
    });

    return activeContainer;
  };

  const getIndicators = (container: HTMLDivElement) => {
    return Array.from(
      container.querySelectorAll("[data-element='indicator']")
    ) as HTMLDivElement[];
  };

  const clearIndicators = (indicators: HTMLDivElement[]) => {
    indicators.forEach((indicator) => (indicator.style.opacity = "0"));
  };

  const getNearestIndicator = (
    clientY: number,
    indicators: HTMLDivElement[]
  ) => {
    return indicators.reduce(
      (closest, child) => {
        const { top } = child.getBoundingClientRect();

        const offset = clientY - (top + 50); // 50 is an offset height

        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators.at(-1),
      }
    );
  };

  const handleOverAndMove = (target: HTMLElement, clientY: number) => {
    const board = ref.current;
    // ignore if the target is the board itself
    if (!board || target === board) return;

    const container = getActiveContainer(target);
    if (!container) return;

    const indicators = getIndicators(container);

    clearIndicators(indicators);

    const nearestIndicator = getNearestIndicator(clientY, indicators);

    if (nearestIndicator.element) {
      nearestIndicator.element.style.opacity = "1";
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const target = event.target as HTMLElement;
    const clientY = event.clientY;

    handleOverAndMove(target, clientY);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const clientX = event.touches[0].clientX;
    const clientY = event.touches[0].clientY;

    const target = document.elementFromPoint(clientX, clientY) as HTMLElement;

    lastClientY.current = clientY;
    handleOverAndMove(target, clientY);
  };

  const handleEnd = (clientY: number) => {
    const container = lastContainer.current;
    if (!container) return;

    const status = container.dataset.status as Status;
    const indicators = getIndicators(container);
    const nearestIndicator = getNearestIndicator(clientY, indicators);
    const indicatorId = Number(nearestIndicator.element!.dataset.indicatorId);

    if (!activeItem || activeItem.id === indicatorId) return;

    const item = { ...activeItem, status };

    const newState = items.filter((item) => item.id !== activeItem.id);

    if (indicatorId === -1) {
      newState.push(item);
    } else {
      const insertAtIndex = newState.findIndex(({ id }) => id === indicatorId);

      newState.splice(insertAtIndex, 0, item);
    }

    clearIndicators(indicators);
    setItems(newState);
  };

  return (
    <section
      ref={ref}
      onDragOver={handleDragOver}
      onDrop={(event) => handleEnd(event.clientY)}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => handleEnd(lastClientY.current)}
      className="flex items-start gap-4"
    >
      <List
        status="unpaid"
        items={items.filter((item) => item.status === "unpaid")}
        setActiveItem={setActiveItem}
      />
      <List
        status="paid"
        items={items.filter((item) => item.status === "paid")}
        setActiveItem={setActiveItem}
      />
    </section>
  );
}
