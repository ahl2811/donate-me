import React, { useState } from "react";

export const Form = ({ onSubmit, loading }) => {
  const [value, setValue] = useState();

  const handleSubmit = async () => {
    if (!value) return;
    await onSubmit(String(value));
    setValue("");
  };

  return (
    <div className="d-flex flex-column gap-3 align-items-center">
      <input
        className="form-control"
        value={value}
        type="number"
        onChange={(e) => setValue(e.target.valueAsNumber)}
        placeholder="Type amount of ETH"
        min={0}
      />
      <button
        className="btn btn-success d-block"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Loading..." : <>Donate Me</>}
      </button>
    </div>
  );
};
