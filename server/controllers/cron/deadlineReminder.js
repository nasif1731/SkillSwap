// cron/deadlineReminder.js
import Project from '../../models/Project.js';
import Notification from '../../models/Notification.js';

export const checkProjectDeadlines = async () => {
    try {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
      const start = new Date(tomorrow);
      start.setUTCHours(0, 0, 0, 0);
  
      const end = new Date(tomorrow);
      end.setUTCHours(23, 59, 59, 999);
  
      console.log('🕓 Deadline window:', start.toISOString(), '→', end.toISOString());
  
      const projects = await Project.find({
        deadline: { $gte: start, $lte: end },
        $or: [
          { reminderSent: false },
          { reminderSent: { $exists: false } }
        ]
      });
  
      console.log(`📦 Projects found in deadline window: ${projects.length}`);
  
      for (let project of projects) {
        console.log('🔔 Sending reminder for:', project.title, 'with deadline:', project.deadline);
  
        const freelancerId = project.freelancer;

        if (freelancerId) {
          await Notification.create({
            user: freelancerId, // ✅ Send to freelancer, not client
            type: 'system',
            message: `⏰ Reminder: Your assigned project "${project.title}" is due tomorrow.`,
          });
        }
  
        project.reminderSent = true;
        await project.save();
      }
  
      console.log(`✅ Deadline reminders sent: ${projects.length}`);
    } catch (error) {
      console.error('❌ Deadline check failed:', error);
    }
  };
  