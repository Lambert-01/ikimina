import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Video, X, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

interface MeetingSchedulerProps {
  groupId: string;
  groupName: string;
  onScheduleMeeting: (meetingData: MeetingFormData) => void;
  className?: string;
}

export interface MeetingFormData {
  title: string;
  date: string;
  startTime: string;
  endTime?: string;
  isVirtual: boolean;
  location?: string;
  virtualMeetingUrl?: string;
  description?: string;
  agenda: string[];
  reminderType: 'none' | 'email' | 'sms' | 'both';
  reminderTime: '30min' | '1hour' | '1day' | '2days';
}

const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({
  groupId,
  groupName,
  onScheduleMeeting,
  className
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<MeetingFormData>({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    isVirtual: false,
    location: '',
    virtualMeetingUrl: '',
    description: '',
    agenda: [''],
    reminderType: 'email',
    reminderTime: '1day'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      isVirtual: checked,
      location: checked ? '' : prev.location,
      virtualMeetingUrl: checked ? prev.virtualMeetingUrl : ''
    }));
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAgendaChange = (index: number, value: string) => {
    const newAgenda = [...formData.agenda];
    newAgenda[index] = value;
    setFormData(prev => ({ ...prev, agenda: newAgenda }));
  };

  const addAgendaItem = () => {
    setFormData(prev => ({ ...prev, agenda: [...prev.agenda, ''] }));
  };

  const removeAgendaItem = (index: number) => {
    const newAgenda = [...formData.agenda];
    newAgenda.splice(index, 1);
    setFormData(prev => ({ ...prev, agenda: newAgenda }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out empty agenda items
    const filteredAgenda = formData.agenda.filter(item => item.trim() !== '');
    const meetingData = { ...formData, agenda: filteredAgenda };
    
    onScheduleMeeting(meetingData);
    setOpen(false);
    
    // Reset form
    setFormData({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      isVirtual: false,
      location: '',
      virtualMeetingUrl: '',
      description: '',
      agenda: [''],
      reminderType: 'email',
      reminderTime: '1day'
    });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={`flex items-center ${className || ''}`}>
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule a Meeting for {groupName}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter meeting title"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-primary-500" />
                Date
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                min={today}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-primary-500" />
                Start Time
              </Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endTime" className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-primary-500" />
                End Time (optional)
              </Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2 flex items-center">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isVirtual"
                  checked={formData.isVirtual}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="isVirtual" className="flex items-center">
                  <Video className="h-4 w-4 mr-2 text-primary-500" />
                  Virtual Meeting
                </Label>
              </div>
            </div>
          </div>
          
          {formData.isVirtual ? (
            <div className="space-y-2">
              <Label htmlFor="virtualMeetingUrl" className="flex items-center">
                <Video className="h-4 w-4 mr-2 text-primary-500" />
                Meeting URL
              </Label>
              <Input
                id="virtualMeetingUrl"
                name="virtualMeetingUrl"
                value={formData.virtualMeetingUrl}
                onChange={handleChange}
                placeholder="Enter meeting URL (Zoom, Google Meet, etc.)"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                Location
              </Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter meeting location"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter meeting description"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Agenda Items</span>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addAgendaItem}
                className="h-8 px-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </Label>
            {formData.agenda.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={item}
                  onChange={(e) => handleAgendaChange(index, e.target.value)}
                  placeholder={`Agenda item ${index + 1}`}
                />
                {formData.agenda.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAgendaItem(index)}
                    className="h-10 w-10 p-0 flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label>Reminder Type</Label>
              <RadioGroup 
                value={formData.reminderType} 
                onValueChange={(value) => handleRadioChange('reminderType', value)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none">No reminder</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email" />
                  <Label htmlFor="email">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sms" id="sms" />
                  <Label htmlFor="sms">SMS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both">Both</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label>Reminder Time</Label>
              <RadioGroup 
                value={formData.reminderTime} 
                onValueChange={(value) => handleRadioChange('reminderTime', value)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="30min" id="30min" />
                  <Label htmlFor="30min">30 minutes before</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1hour" id="1hour" />
                  <Label htmlFor="1hour">1 hour before</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1day" id="1day" />
                  <Label htmlFor="1day">1 day before</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2days" id="2days" />
                  <Label htmlFor="2days">2 days before</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Schedule Meeting</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingScheduler; 