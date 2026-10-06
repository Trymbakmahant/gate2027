import { TopicModule } from './types';
import { linearRegressionModule } from './topics/machine-learning/linear-regression';
import { supervisedFormulationModule } from './topics/machine-learning/supervised-formulation';
import { matricesModule } from './topics/linear-algebra/matrices';

// Internal module dictionary
const MODULE_REGISTRY: Record<string, TopicModule> = {};

/**
 * Register a topic module into the central registry.
 */
export function registerTopicModule(module: TopicModule): void {
  MODULE_REGISTRY[module.subtopicId] = module;
}

// Pre-register existing modules
registerTopicModule(linearRegressionModule);
registerTopicModule(supervisedFormulationModule);
registerTopicModule(matricesModule);
// Alias so both "matrices" and "matrices-types-properties" resolve seamlessly
MODULE_REGISTRY['matrices-types-properties'] = matricesModule;

/**
 * Retrieve a registered topic module by its syllabus subtopic ID.
 */
export function getTopicModule(subtopicId: string): TopicModule | undefined {
  return MODULE_REGISTRY[subtopicId];
}

/**
 * Check if a subtopic has an interactive simulation/lab registered.
 */
export function hasInteractiveSimulation(subtopicId: string): boolean {
  const mod = MODULE_REGISTRY[subtopicId];
  return Boolean(mod?.simulation);
}

/**
 * Check if a subtopic has practice questions/test registered.
 */
export function hasTopicTest(subtopicId: string): boolean {
  const mod = MODULE_REGISTRY[subtopicId];
  return Boolean(mod?.quiz && mod.quiz.questions.length > 0);
}

/**
 * Get question count for a subtopic.
 */
export function getTopicQuestionCount(subtopicId: string): number {
  const mod = MODULE_REGISTRY[subtopicId];
  return mod?.quiz?.questions?.length || 0;
}

/**
 * Returns a list of all registered topic module IDs.
 */
export function getAllRegisteredTopicIds(): string[] {
  return Object.keys(MODULE_REGISTRY);
}
