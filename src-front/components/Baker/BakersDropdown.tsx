import Select from "react-select";
import makeAnimated from "react-select/animated";
import { useState } from "react";

interface BakerOptionType {
  label: string;
  value: string;
  customAbbreviation: string;
  yields: string;
}

const formatOptionLabel = ({
  label,
  customAbbreviation,
  yields,
}: BakerOptionType) => (
  <div style={{ display: "flex", alignItems: "center" }}>
    <img
      src={customAbbreviation}
      alt={label}
      style={{ width: "30px", height: "30px", marginRight: "10px" }}
    />
    <div style={{ flex: 1, color: "white" }}>
      {label}
      <div style={{ fontSize: "0.8rem", color: "#888" }}>{yields}% yield</div>
    </div>
  </div>
);

const BakersDropdown: React.FC<any> = ({
  bakers,
  onSelect,
  isDelegated,
  DelegatedAddress,
}) => {
  const [selectedOption, setSelectedOption] = useState<any>();
  const animatedComponents = makeAnimated();

  let options = [
    {
      value: "",
      label: "",
      customAbbreviation: "",
      yields: 0,
    },
  ];
  if (isDelegated) {
  } else {
    options = bakers.map((baker: any) => ({
      value: baker.address,
      label: baker.name,
      customAbbreviation: baker.logo,
      yields: baker.yield,
    }));
  }

  return (
    <Select
      components={animatedComponents}
      options={options}
      value={selectedOption}
      onChange={(option: any) => {
        onSelect(option);
      }}
      formatOptionLabel={formatOptionLabel}
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.value}
      isSearchable={true}
      isClearable={true}
      placeholder="Select a baker..."
      styles={{
        menu: (provided) => ({
          ...provided,
          backgroundColor: "#222222",
          color: "white",
        }),
        placeholder: (defaultStyles) => {
          return {
            ...defaultStyles,
            color: "white", // Set the color of placeholder text to white
          };
        },
        indicatorSeparator: (base) => ({
          ...base,
          backgroundColor: "white",
        }),
        clearIndicator: (defaultStyles) => ({
          ...defaultStyles,
          color: "white",
        }),
        dropdownIndicator: (defaultStyles) => ({
          ...defaultStyles,
          color: "white",
        }),
        input: (styles) => ({
          ...styles,
          color: "white",
        }),
        control: (base) => ({
          ...base,
          fontSize: "1.2rem",
          borderColor: "blue",
          boxShadow: "none",
          "&:hover": { borderColor: "blue" },
          height: "56px",
          width: "600px",
          color: "white",
          borderRadius: "40px",
          cursor: "pointer",
          backgroundColor: "#222222",
          border: 0,
        }),
        option: (provided, state) => ({
          ...provided,
          backgroundColor: state.isFocused ? "#3d3c3c" : "#222222",
          color: state.isFocused ? "white" : "white",
          cursor: "pointer",
          ":active": {
            ...provided[":active"],
            backgroundColor: state.isFocused
              ? "rgba(34, 34, 34, 0.8)"
              : "#222222",
          },
        }),
      }}
    />
  );
};

export default BakersDropdown;
