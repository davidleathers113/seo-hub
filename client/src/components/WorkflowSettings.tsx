import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { LLM, StepSettings, getAllLLMs, getWorkflowSettings, updateStepSettings, resetWorkflowSettings } from '@/api/workflow';
import type { WorkflowSettings as IWorkflowSettings } from '@/api/workflow';

const WORKFLOW_STEPS = [
  {
    name: 'Pillar Generation',
    description: 'Generate main content pillars for the given niche',
    defaultPrompt: 'Analyze the given niche and generate comprehensive content pillars that cover the main aspects and topics within this niche.'
  },
  {
    name: 'Subpillar Generation',
    description: 'Generate detailed subpillars for each main pillar',
    defaultPrompt: 'For the given content pillar, generate specific and detailed subpillars that break down the main topic into actionable content pieces.'
  },
  {
    name: 'Research',
    description: 'Conduct in-depth research for each subpillar',
    defaultPrompt: 'Perform comprehensive research on the given subpillar topic. Include relevant statistics, expert opinions, and current trends.'
  },
  {
    name: 'Outline',
    description: 'Create detailed content outlines',
    defaultPrompt: 'Create a detailed outline for the article based on the research. Include main points and supporting arguments.'
  },
  {
    name: 'Article Generation',
    description: 'Generate the full article content',
    defaultPrompt: 'Using the outline and research, generate a comprehensive, engaging, and informative article.'
  },
  {
    name: 'SEO Grade',
    description: 'Evaluate and grade the article for SEO optimization',
    defaultPrompt: 'Analyze the article for SEO effectiveness. Check keyword usage, meta descriptions, headings, and content structure.'
  },
  {
    name: 'Article Improvement',
    description: 'Enhance the article based on SEO recommendations',
    defaultPrompt: 'Improve the article based on the SEO analysis. Optimize keyword placement and enhance readability.'
  }
];

export function WorkflowSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [llms, setLLMs] = useState<LLM[]>([]);
  const [settings, setSettings] = useState<IWorkflowSettings>({ steps: [], defaultSteps: [] });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [llmsData, settingsData] = await Promise.all([
        getAllLLMs(),
        getWorkflowSettings()
      ]);
      setLLMs(llmsData);
      setSettings(settingsData || { steps: [], defaultSteps: [] });
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workflow settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingUpdate = async (stepName: string, updates: Partial<StepSettings>) => {
    setLoading(true);
    try {
      await updateStepSettings(stepName, updates);
      setSettings(prevSettings => ({
        ...prevSettings,
        steps: prevSettings.steps.map(setting =>
          setting.stepName === stepName ? { ...setting, ...updates } : setting
        )
      }));
      toast({
        title: 'Success',
        description: 'Settings updated successfully',
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = async () => {
    setLoading(true);
    try {
      await resetWorkflowSettings();
      await loadData();
      toast({
        title: 'Success',
        description: 'Settings reset to default',
      });
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const groupLLMsByProvider = () => {
    const grouped: Record<string, LLM[]> = {};
    llms.forEach(llm => {
      if (!grouped[llm.provider]) {
        grouped[llm.provider] = [];
      }
      grouped[llm.provider].push(llm);
    });
    return grouped;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Workflow Settings</h2>
        <Button
          variant="outline"
          onClick={handleResetSettings}
          disabled={loading}
        >
          Reset All to Default
        </Button>
      </div>

      {WORKFLOW_STEPS.map((step) => {
        const stepSettings = settings.steps?.find(s => s.stepName === step.name) || {
          stepName: step.name,
          modelId: '',
          temperature: 0.7,
          maxTokens: 1000,
          prompt: step.defaultPrompt,
        };

        return (
          <Card key={step.name}>
            <CardHeader>
              <CardTitle>{step.name}</CardTitle>
              <CardDescription>{step.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>AI Model</Label>
                <Select
                  value={stepSettings.modelId}
                  onValueChange={(value) => handleSettingUpdate(step.name, { modelId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(groupLLMsByProvider()).map(([provider, models]) => (
                      <React.Fragment key={provider}>
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                          {provider.toUpperCase()}
                        </div>
                        {models.map((model) => (
                          <SelectItem key={model.modelId} value={model.modelId}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </React.Fragment>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Temperature ({stepSettings.temperature})</Label>
                <Slider
                  value={[stepSettings.temperature]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={([value]) => handleSettingUpdate(step.name, { temperature: value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Max Tokens</Label>
                <Slider
                  value={[stepSettings.maxTokens]}
                  min={100}
                  max={4000}
                  step={100}
                  onValueChange={([value]) => handleSettingUpdate(step.name, { maxTokens: value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Prompt</Label>
                <Textarea
                  value={stepSettings.prompt}
                  onChange={(e) => handleSettingUpdate(step.name, { prompt: e.target.value })}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
