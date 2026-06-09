import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_EXERCISES = [
  { id: "bench-press",      name: "Bench Press",      category: "CHEST",     muscleGroups: ["Chest","Triceps","Shoulders"], equipment: ["Barbell"] },
  { id: "incline-press",    name: "Incline Press",     category: "CHEST",     muscleGroups: ["Upper Chest","Shoulders"],     equipment: ["Barbell"] },
  { id: "dumbbell-flyes",   name: "Dumbbell Flyes",    category: "CHEST",     muscleGroups: ["Chest"],                       equipment: ["Dumbbell"] },
  { id: "push-ups",         name: "Push-Ups",          category: "CHEST",     muscleGroups: ["Chest","Triceps"],             equipment: ["Bodyweight"] },
  { id: "squat",            name: "Squat",             category: "LEGS",      muscleGroups: ["Quads","Glutes","Hamstrings"], equipment: ["Barbell"] },
  { id: "deadlift",         name: "Deadlift",          category: "LEGS",      muscleGroups: ["Hamstrings","Glutes","Back"],  equipment: ["Barbell"] },
  { id: "leg-press",        name: "Leg Press",         category: "LEGS",      muscleGroups: ["Quads","Glutes"],              equipment: ["Machine"] },
  { id: "lunges",           name: "Lunges",            category: "LEGS",      muscleGroups: ["Quads","Glutes"],              equipment: ["Dumbbell"] },
  { id: "leg-curl",         name: "Leg Curl",          category: "LEGS",      muscleGroups: ["Hamstrings"],                  equipment: ["Machine"] },
  { id: "calf-raises",      name: "Calf Raises",       category: "LEGS",      muscleGroups: ["Calves"],                     equipment: ["Machine"] },
  { id: "pull-ups",         name: "Pull-Ups",          category: "BACK",      muscleGroups: ["Lats","Biceps"],               equipment: ["Bodyweight"] },
  { id: "barbell-row",      name: "Barbell Row",       category: "BACK",      muscleGroups: ["Back","Biceps"],               equipment: ["Barbell"] },
  { id: "lat-pulldown",     name: "Lat Pulldown",      category: "BACK",      muscleGroups: ["Lats","Biceps"],               equipment: ["Cable"] },
  { id: "cable-row",        name: "Cable Row",         category: "BACK",      muscleGroups: ["Back","Biceps"],               equipment: ["Cable"] },
  { id: "overhead-press",   name: "Overhead Press",    category: "SHOULDERS", muscleGroups: ["Shoulders","Triceps"],         equipment: ["Barbell"] },
  { id: "lateral-raises",   name: "Lateral Raises",    category: "SHOULDERS", muscleGroups: ["Shoulders"],                  equipment: ["Dumbbell"] },
  { id: "face-pulls",       name: "Face Pulls",        category: "SHOULDERS", muscleGroups: ["Rear Delts","Upper Back"],     equipment: ["Cable"] },
  { id: "barbell-curl",     name: "Barbell Curl",      category: "ARMS",      muscleGroups: ["Biceps"],                     equipment: ["Barbell"] },
  { id: "hammer-curl",      name: "Hammer Curl",       category: "ARMS",      muscleGroups: ["Biceps","Forearms"],           equipment: ["Dumbbell"] },
  { id: "tricep-pushdown",  name: "Tricep Pushdown",   category: "ARMS",      muscleGroups: ["Triceps"],                    equipment: ["Cable"] },
  { id: "skull-crushers",   name: "Skull Crushers",    category: "ARMS",      muscleGroups: ["Triceps"],                    equipment: ["Barbell"] },
  { id: "dips",             name: "Dips",              category: "ARMS",      muscleGroups: ["Triceps","Chest"],             equipment: ["Bodyweight"] },
  { id: "plank",            name: "Plank",             category: "CORE",      muscleGroups: ["Core"],                       equipment: ["Bodyweight"] },
  { id: "hanging-leg-raise",name: "Hanging Leg Raise", category: "CORE",      muscleGroups: ["Core","Hip Flexors"],          equipment: ["Bodyweight"] },
  { id: "ab-wheel",         name: "Ab Wheel",          category: "CORE",      muscleGroups: ["Core"],                       equipment: ["Other"] },
  { id: "running",          name: "Running",           category: "CARDIO",    muscleGroups: ["Full Body"],                  equipment: ["Bodyweight"] },
  { id: "cycling",          name: "Cycling",           category: "CARDIO",    muscleGroups: ["Legs"],                       equipment: ["Machine"] },
  { id: "rowing",           name: "Rowing",            category: "CARDIO",    muscleGroups: ["Back","Arms","Legs"],          equipment: ["Machine"] },
];

// GET /api/exercises – return all (global + user custom)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ensure global exercises exist
    await seedExercises();

    const exercises = await prisma.exercise.findMany({
      where: { OR: [{ userId: null }, { userId: session.user.id }] },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(exercises);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/exercises – create custom exercise
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, category, muscleGroups, equipment, description } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const exercise = await prisma.exercise.create({
      data: {
        userId: session.user.id,
        name,
        category: category || "OTHER",
        muscleGroups: muscleGroups || [],
        equipment: equipment || [],
        description,
        isCustom: true,
      },
    });
    return NextResponse.json(exercise, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

async function seedExercises() {
  // Only seed if none exist yet (idempotent)
  const existing = await prisma.exercise.count({ where: { userId: null } });
  if (existing >= DEFAULT_EXERCISES.length) return;

  for (const ex of DEFAULT_EXERCISES) {
    await prisma.exercise.upsert({
      where: { id: ex.id },
      update: {},
      create: { id: ex.id, name: ex.name, category: ex.category as any, muscleGroups: ex.muscleGroups, equipment: ex.equipment, isCustom: false },
    });
  }
}
