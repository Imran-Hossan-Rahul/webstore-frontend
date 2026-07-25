"use client";
import { useState, useEffect } from "react";
import { User, Check, Loader2, MapPin, Hash, Briefcase, ChevronDown } from "lucide-react";
import CustomSelect from "@/components/ui/CustomSelect";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/ToastProvider";

const PRONOUNS = ["He/Him", "She/Her", "They/Them", "Ze/Zir", "Prefer not to say", ""];
const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "other", label: "Other" },
];
const AVAILABILITY = [
  { value: "available",   label: "Available",      color: "text-emerald-500 bg-emerald-500/10" },
  { value: "busy",        label: "Busy",            color: "text-amber-500 bg-amber-500/10" },
  { value: "vacation",    label: "On Vacation",     color: "text-blue-500 bg-blue-500/10" },
  { value: "unavailable", label: "Not Available",   color: "text-red-500 bg-red-500/10" },
];

function Field({ label, error, children }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-500 px-0.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 font-medium mt-1 px-0.5">{error}</p>}
    </div>
  );
}

export default function ProfileTab({ user, refreshUser }) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState("idle");
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "", username: "", bio: "", skills: "", gender: "",
    workType: "solo", pronouns: "", availabilityStatus: "available",
    hourlyRate: "", mentorshipRate: "", openToWork: false,
    location: { city: "", country: "" },
  });

  useEffect(() => {
    if (user) setForm({
      name:               user.name || "",
      username:           user.username || "",
      bio:                user.bio || "",
      skills:             user.skills?.join(", ") || "",
      gender:             user.gender || "",
      workType:           user.workType || "solo",
      pronouns:           user.pronouns || "",
      availabilityStatus: user.availabilityStatus || "available",
      hourlyRate:         user.hourlyRate || "",
      mentorshipRate:     user.mentorshipRate || "",
      openToWork:         user.openToWork || false,
      location: { city: user.location?.city || "", country: user.location?.country || "" },
    });
  }, [user]);

  const set = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    if (field === 'name') {
      if (!value) setErrors(p => ({ ...p, name: "Name is required" }));
      else setErrors(p => { const e = { ...p }; delete e.name; return e; });
    }
  };

  const validateUrl = (url) => !url || /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(url);

  useEffect(() => {
    if (!form.username || form.username === user?.username) { setUsernameStatus("idle"); return; }
    if (form.username.length < 3) { setUsernameStatus("idle"); return; }
    setUsernameStatus("checking");
    const t = setTimeout(async () => {
      try {
        const res = await api.get(`/user/check-username?username=${form.username}`);
        setUsernameStatus(res.available ? "available" : "taken");
      } catch { setUsernameStatus("idle"); }
    }, 600);
    return () => clearTimeout(t);
  }, [form.username, user?.username]);

  const handleSave = async () => {
    const errs = {};
    if (!form.name) errs.name = "Name is required";
    if (form.username.length < 3) errs.username = "Username too short";
    if (Object.keys(errs).length) { setErrors(errs); showToast("Fix errors before saving", "error"); return; }

    setSaving(true);
    try {
      const [r1, r2] = await Promise.all([
        api.patch("/user/profile", {
          name: form.name, username: form.username, bio: form.bio,
          skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
          workType: form.workType,
          gender: form.gender,
          location: form.location,
        }),
        api.patch("/user/profile-extras", {
          pronouns: form.pronouns,
          availabilityStatus: form.availabilityStatus,
          hourlyRate: parseFloat(form.hourlyRate) || 0,
          mentorshipRate: parseFloat(form.mentorshipRate) || 50,
          openToWork: form.openToWork,
        }),
      ]);
      if (r1.success) { showToast("Profile updated!", "success"); if (refreshUser) await refreshUser(); }
    } catch { showToast("Failed to save", "error"); } finally { setSaving(false); }
  };

  const inputCls = (err) =>
    `w-full bg-transparent border-b ${err ? "border-red-400" : "border-slate-200 dark:border-white/10 focus:border-black dark:focus:border-white"} px-0 py-3 text-sm font-medium transition-all outline-none rounded-none`;

  const avail = AVAILABILITY.find(a => a.value === form.availabilityStatus);

  useEffect(() => {
    const handleTrigger = () => handleSave();
    window.addEventListener("trigger-save-profile", handleTrigger);
    return () => window.removeEventListener("trigger-save-profile", handleTrigger);
  }, [form, handleSave]);

  return (
    <div className="max-w-full space-y-10">
      <header>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Profile Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Configure your public presence and professional availability.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-x-12 gap-y-12">
        {/* Left Column: Identity & Bio */}
        <div className="space-y-10">
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-400 border-b border-slate-100 dark:border-white/5 pb-2">Identity</h3>
            
            <Field label="Display Name" error={errors.name}>
              <input type="text" value={form.name} onChange={e => set("name", e.target.value)}
                placeholder="John Doe" className={inputCls(errors.name)} />
            </Field>

            <Field label="Username">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center text-slate-400 font-medium text-sm">@</span>
                <input type="text" value={form.username}
                  onChange={e => set("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  className={`w-full bg-transparent border-b-2 ${usernameStatus === "taken" ? "border-red-400" : usernameStatus === "available" ? "border-emerald-400" : "border-slate-200 dark:border-white/10 focus:border-black dark:focus:border-white"} pl-6 pr-12 py-3 text-sm font-medium transition-all outline-none rounded-none`} />
                <span className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  {usernameStatus === "checking" && <Loader2 size={14} className="animate-spin text-slate-400" />}
                  {usernameStatus === "available" && <Check size={14} className="text-emerald-500" />}
                  {usernameStatus === "taken" && <span className="text-red-500 font-bold text-sm">✕</span>}
                </span>
              </div>
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pt-2">
              <CustomSelect
                label="Pronouns"
                value={form.pronouns}
                onChange={v => set("pronouns", v)}
                options={PRONOUNS}
              />
              <CustomSelect
                label="Gender"
                value={form.gender}
                onChange={v => set("gender", v)}
                options={GENDER_OPTIONS}
              />
            </div>
            <div className="pt-2">
              <CustomSelect
                label="Availability Status"
                value={form.availabilityStatus}
                onChange={v => set("availabilityStatus", v)}
                options={AVAILABILITY}
              />
            </div>
          </div>

          <div className="space-y-6 pt-2">
            <h3 className="text-sm font-bold text-slate-400 border-b border-slate-100 dark:border-white/5 pb-2">Your Story</h3>
            <Field label={<span className="flex items-center justify-between w-full"><span>Biography</span><span className="font-medium text-slate-400">{form.bio.length}/500</span></span>}>
              <textarea value={form.bio} onChange={e => set("bio", e.target.value)} rows={5} maxLength={500}
                className={`${inputCls(false)} resize-none leading-relaxed font-medium`} placeholder="Tell the world your story..." />
            </Field>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden lg:block w-px bg-slate-200 dark:bg-white/10" />

        {/* Right Column: Work & Location */}
        <div className="space-y-10">
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-400 border-b border-slate-100 dark:border-white/5 pb-2">Professional</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
              <Field label="Hourly Rate (Tokens)">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center text-slate-400"><Hash size={16} /></span>
                  <input type="number" min="0" value={form.hourlyRate} onChange={e => set("hourlyRate", e.target.value)}
                    placeholder="0" className={`${inputCls(false)} pl-6`} />
                </div>
              </Field>
              <Field label="Mentorship Rate (TKNS)">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center text-slate-400"><Hash size={16} /></span>
                  <input type="number" min="0" value={form.mentorshipRate} onChange={e => set("mentorshipRate", e.target.value)}
                    placeholder="50" className={`${inputCls(false)} pl-6`} />
                </div>
              </Field>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-white/10 rounded-none bg-transparent">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Open to Work</p>
                <p className="text-xs text-slate-500 font-medium">Public Badge</p>
              </div>
              <button type="button" onClick={() => set("openToWork", !form.openToWork)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${form.openToWork ? "bg-black dark:bg-white" : "bg-slate-200 dark:bg-white/10"}`}>
                <span className={`inline-block h-3 w-3 rounded-full ${form.openToWork ? "bg-white dark:bg-black" : "bg-white"} shadow transform transition-opacity ${form.openToWork ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            <Field label="Work Configuration">
              <div className="grid grid-cols-2 gap-4">
                {[{ v: "solo", l: "Solo", s: "Independent" }, { v: "team", l: "Team", s: "Agency" }].map(({ v, l, s }) => (
                  <button key={v} type="button" onClick={() => set("workType", v)}
                    className={`py-4 border-b-2 text-left transition-all rounded-none ${form.workType === v ? "border-black dark:border-white text-black dark:text-white" : "border-slate-100 dark:border-white/5 text-slate-400 hover:border-slate-300"}`}>
                    <div className="font-bold text-sm">{l}</div>
                    <div className="text-xs opacity-70 mt-0.5 font-medium">{s}</div>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Expertise (Comma Separated)">
              <input type="text" value={form.skills} onChange={e => set("skills", e.target.value)}
                placeholder="React, Next.js, UI/UX" className={inputCls(false)} />
            </Field>
          </div>

          <div className="space-y-6 pt-2">
            <h3 className="text-sm font-bold text-slate-400 border-b border-slate-100 dark:border-white/5 pb-2">Location</h3>
            <div className="grid grid-cols-2 gap-8">
              <Field label="City">
                <input type="text" value={form.location.city} onChange={e => setForm(p => ({ ...p, location: { ...p.location, city: e.target.value } }))}
                  placeholder="Dhaka" className={inputCls(false)} />
              </Field>
              <Field label="Country">
                <input type="text" value={form.location.country} onChange={e => setForm(p => ({ ...p, location: { ...p.location, country: e.target.value } }))}
                  placeholder="Bangladesh" className={inputCls(false)} />
              </Field>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
