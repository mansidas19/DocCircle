import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DoctorProfile from "@/components/DoctorProfile";
import { DOCTORS } from "@/lib/demo-data";
import { getDoctor } from "@/lib/utils";

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return DOCTORS.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const doctor = getDoctor(id);
  return { title: doctor ? `${doctor.name} — DocCircle` : "Doctor not found — DocCircle" };
}

export default async function DoctorPage({ params }: { params: Params }) {
  const { id } = await params;
  const doctor = getDoctor(id);
  if (!doctor) notFound();
  return <DoctorProfile doctor={doctor} />;
}
