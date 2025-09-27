import Button from "../Button";
import { FiPlus } from "react-icons/fi";
import SideBarButton from "../SideBarButton";
import { AiFillHome } from "react-icons/ai";
import InputField from "../InputField";
import { BiBriefcase, BiSearch } from "react-icons/bi";
import DropDownField from "../DropDownField";
import { FaList } from "react-icons/fa";
import LabeledInputField from "../LabeledInputField";
import LabeledDropDownField from "../LabeledDropDownField";
import LabeledDropDownFieldWithButton from "../LabeledDorpDownFieldWithButton";
import SettingsOptionsTile from "../SettingsOptionsTile";
import SettingsToggleTile from "../SettingsToggleTile";
import TabButton from "../TabButton";
import ProfileInfoCard from "../ProfileInfoCard";
import DashboardInfoCard from "../DashboardCard";

function ComponentsTestPage() {
  const options = [
    { label: "Option 1", value: "1" },
    { label: "Option 2", value: "2" },
    { label: "Option 3", value: "3" },
  ];

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-2">
      <Button label="Add Item" icon={<FiPlus />} />

      <TabButton
        label="Tab 1"
        selected={true}
        icon={<FiPlus />}
        className="shadow-md"
      />
      <TabButton
        label="Tab 2"
        icon={<FiPlus />}
        selected={false}
        // className="border border-red-500"
      />

      <div className="w-xs gap-2 flex flex-col">
        <SideBarButton
          label="Home"
          selected={true}
          //   collapsed
          icon={<AiFillHome />}
        />
        <SideBarButton
          label="Home"
          selected={false}
          //   collapsed
          icon={<AiFillHome />}
        />
      </div>

      <div className="">
        <InputField
          placeholder="Search"
          disabled={false}
          leading={<BiSearch />}
          //   multiline={true}
          //   rows={3}
        />
      </div>

      <div className="">
        <DropDownField
          options={options}
          //   icon={<FaList />}
          onChange={(e) => console.log("Selected:", e.target.value)}
          disabled={false}
        />
      </div>

      <div className="w-xl">
        <LabeledInputField
          title="Username"
          placeholder="Enter your username"
          //   icon={<i className="fas fa-user" />}
          required
          onChange={(e) => console.log("Username:", e.target.value)}
        />
      </div>

      <div className="w-xl">
        <LabeledInputField
          title="Bio"
          multiline
          rows={4}
          placeholder="Tell us about yourself..."
          hint="Max 200 characters"
        />
      </div>

      <div className="w-xl">
        <LabeledDropDownField
          label="Select Option"
          options={options}
          placeholder="Pick one"
          icon={<FaList />}
          onChange={(e) => console.log("Selected value:", e.target.value)}
        />
      </div>
      <div className="w-xl">
        <LabeledDropDownField
          label="Disabled Dropdown"
          options={options}
          value="2"
          disabled
          hint="You cannot change this"
        />
      </div>

      <div className="w-xl">
        <LabeledDropDownFieldWithButton
          label="Choose a fruit"
          options={[
            { label: "Apple", value: "apple" },
            { label: "Banana", value: "banana" },
            { label: "Cherry", value: "cherry" },
          ]}
          placeholder="Select fruit..."
          required
          buttonLabel="Add"
          buttonIcon={<FiPlus />}
          onButtonClick={() => alert("Button clicked!")}
          hint="Pick your favorite fruit, then press Add."
        />
      </div>

      <div className="w-xl">
        <SettingsOptionsTile
          label="Label"
          desc="This is some desc about the option"
          options={options}
        />
      </div>

      <div className="w-xl">
        <SettingsToggleTile
          label="Enable Notifications"
          desc="Get notified for new updates"
          checked={false}
          onChange={(e) => console.log("Toggled:", e.target.checked)}
        />
      </div>

      <div className="w-2xl flex flex-col gap-2">
        <ProfileInfoCard
          imageUrl="https://i.pravatar.cc/150?img=5"
          fullName="Junaid Ahmed"
          email="junaid@example.com"
        />

        <ProfileInfoCard
          imageElement={
            <img
              src="https://i.pravatar.cc/150?img=10"
              alt="Custom Avatar"
              className="w-12 h-12 rounded-full border-2 border-primary"
            />
          }
          fullName="Dr. Sarah Khan"
          email="sarah.khan@hospital.com"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <DashboardInfoCard
          icon={<BiBriefcase />}
          label="Upcoming Appointments"
          value={12}
        />

        <DashboardInfoCard
          icon={<BiBriefcase />}
          label="Completed Appointments"
          value={34}
        />

        <DashboardInfoCard
          icon={<BiBriefcase />}
          label="Cancelled Appointments"
          value={5}
        />
      </div>
    </div>
  );
}

export default ComponentsTestPage;
