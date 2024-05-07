import { useState } from "react";
import { data } from "./data";
import Chart from "./components/chart";
import Board from "./components/board";

function App() {
  const [state, setState] = useState(data);

  return (
    <div className="w-full min-h-screen">
      <div className="max-w-[1024px] mx-auto p-4">
        <section className="flex items-center justify-center">
          <Chart data={state} />
        </section>
        <Board items={state} setItems={setState} />
      </div>
    </div>
  );
}

export default App;
