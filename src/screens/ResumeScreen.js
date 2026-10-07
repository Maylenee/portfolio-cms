import Empty from '../components/Empty';
import Timeline from '../components/Timeline';

export default function ResumeScreen({ content }) {
  const sections = content.resume.sections;
  if (sections.length === 0) return <Empty>Resume belum diisi.</Empty>;
  return <Timeline sections={sections} accent={content.settings.accent} />;
}
