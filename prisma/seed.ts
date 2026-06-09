import { PrismaClient } from "@prisma/client";
import { DEFAULT_ACHIEVEMENTS } from "../src/lib/gamification";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Seed default exercises
  const exercises = [
    { name: "Bench Press", category: "CHEST", muscleGroups: ["Chest", "Triceps", "Shoulders"], equipment: ["Barbell"] },
    { name: "Incline Bench Press", category: "CHEST", muscleGroups: ["Upper Chest", "Shoulders", "Triceps"], equipment: ["Barbell"] },
    { name: "Dumbbell Flyes", category: "CHEST", muscleGroups: ["Chest"], equipment: ["Dumbbell"] },
    { name: "Push-ups", category: "CHEST", muscleGroups: ["Chest", "Triceps", "Shoulders"], equipment: ["Bodyweight"] },
    { name: "Squat", category: "LEGS", muscleGroups: ["Quads", "Glutes", "Hamstrings"], equipment: ["Barbell"] },
    { name: "Deadlift", category: "LEGS", muscleGroups: ["Hamstrings", "Glutes", "Back"], equipment: ["Barbell"] },
    { name: "Leg Press", category: "LEGS", muscleGroups: ["Quads", "Glutes"], equipment: ["Machine"] },
    { name: "Lunges", category: "LEGS", muscleGroups: ["Quads", "Glutes"], equipment: ["Dumbbell"] },
    { name: "Leg Curl", category: "LEGS", muscleGroups: ["Hamstrings"], equipment: ["Machine"] },
    { name: "Calf Raises", category: "LEGS", muscleGroups: ["Calves"], equipment: ["Machine"] },
    { name: "Pull-ups", category: "BACK", muscleGroups: ["Lats", "Biceps"], equipment: ["Bodyweight"] },
    { name: "Barbell Row", category: "BACK", muscleGroups: ["Back", "Biceps"], equipment: ["Barbell"] },
    { name: "Lat Pulldown", category: "BACK", muscleGroups: ["Lats", "Biceps"], equipment: ["Cable"] },
    { name: "Seated Cable Row", category: "BACK", muscleGroups: ["Back", "Biceps"], equipment: ["Cable"] },
    { name: "Overhead Press", category: "SHOULDERS", muscleGroups: ["Shoulders", "Triceps"], equipment: ["Barbell"] },
    { name: "Lateral Raises", category: "SHOULDERS", muscleGroups: ["Shoulders"], equipment: ["Dumbbell"] },
    { name: "Face Pulls", category: "SHOULDERS", muscleGroups: ["Rear Delts", "Upper Back"], equipment: ["Cable"] },
    { name: "Barbell Curl", category: "ARMS", muscleGroups: ["Biceps"], equipment: ["Barbell"] },
    { name: "Tricep Pushdown", category: "ARMS", muscleGroups: ["Triceps"], equipment: ["Cable"] },
    { name: "Dips", category: "ARMS", muscleGroups: ["Triceps", "Chest"], equipment: ["Bodyweight"] },
    { name: "Plank", category: "CORE", muscleGroups: ["Core"], equipment: ["Bodyweight"] },
    { name: "Hanging Leg Raises", category: "CORE", muscleGroups: ["Core", "Hip Flexors"], equipment: ["Bodyweight"] },
    { name: "Running", category: "CARDIO", muscleGroups: ["Full Body"], equipment: ["Bodyweight"] },
    { name: "Cycling", category: "CARDIO", muscleGroups: ["Legs"], equipment: ["Machine"] },
  ];

  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { id: exercise.name.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: {
        id: exercise.name.toLowerCase().replace(/\s+/g, "-"),
        name: exercise.name,
        category: exercise.category as any,
        muscleGroups: exercise.muscleGroups,
        equipment: exercise.equipment,
        isCustom: false,
      },
    });
  }

  // Seed achievements
  for (const achievement of DEFAULT_ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { id: achievement.name.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: {
        id: achievement.name.toLowerCase().replace(/\s+/g, "-"),
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category as any,
        rarity: achievement.rarity as any,
        xpReward: achievement.xpReward,
        condition: achievement.condition,
      },
    });
  }

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
