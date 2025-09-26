import gradient from "../../assets/images/gradient.png";
import ProfileInfoCard from "../../components/ProfileInfoCard";
import Button from "../../components/Button";
import LabeledInputField from "../../components/LabeledInputField";

function PatientDemographicsPage() {
  return (
    <div className="py-5 px-10 w-full h-4">
      {/* TODO: change the image to actual gradient */}
      <img src={gradient} className="w-full" />

      <div className="flex items-center justify-between">
        <ProfileInfoCard
          fullName="Junaid Ahmed"
          email="Junaid@gmail.com"
          imageUrl="https://i.pravatar.cc/150?img=10"
        />

        <Button label="Edit" />
      </div>

      <div className="flex flex-col gap-5 px-4">
        <div className="flex items-center justify-between gap-10">
          <LabeledInputField
            title="First Name"
            placeholder="Enter your first name"
          />

          <LabeledInputField
            title="Last Name"
            placeholder="Enter your Last name"
          />
        </div>

        <div className="flex items-center justify-between gap-10">
          <LabeledInputField
            title="First Name"
            placeholder="Enter your first name"
          />

          <LabeledInputField
            title="Last Name"
            placeholder="Enter your Last name"
          />
        </div>

        <div className="flex items-center justify-between gap-10">
          <LabeledInputField
            title="First Name"
            placeholder="Enter your first name"
          />

          <LabeledInputField
            title="Last Name"
            placeholder="Enter your Last name"
          />
        </div>
      </div>
    </div>
  );
}

export default PatientDemographicsPage;
