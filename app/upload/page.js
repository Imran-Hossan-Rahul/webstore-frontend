import TemplateUploadFullDebug from "@/components/Form/TemplateUpload";
import SmoothCursor from "@/components/MainCursor";
import TrackerClient from "@/components/TrackerClient";

export default function Template(){
    return (
      <div>
        <SmoothCursor smoothness={0.05} />
        <TrackerClient />
        <TemplateUploadFullDebug />
      </div>
    );
}