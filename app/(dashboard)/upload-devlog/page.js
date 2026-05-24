import CreateDevlog from "@/components/Form/CreateDevlog";
import TrackerPatron from "@/components/TrackerPatron";

export default function UploadDevlogPage(){
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <TrackerPatron />
        <CreateDevlog />
      </div>
    );
}
