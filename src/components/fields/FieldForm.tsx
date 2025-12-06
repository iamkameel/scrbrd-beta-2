"use client";

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { FieldActionState } from "@/app/actions/fieldActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, CheckCircle2, AlertTriangle, MapPin, Upload, User, Plus, X, Image as ImageIcon } from "lucide-react";
import { useFormStatus } from "react-dom";
import { School } from "@/types/firestore";
import { fieldSchema } from "@/lib/validations/fieldSchema";
import { z } from "zod";
import { toast } from "sonner";
import { WeatherWidget } from "@/components/fixtures/WeatherWidget";

interface FieldFormProps {
  mode: 'create' | 'edit';
  fieldAction: (prevState: FieldActionState, formData: FormData) => Promise<FieldActionState>;
  initialState: FieldActionState;
  initialData?: any;
  schools: School[];
}

function SubmitButton({ mode }: { mode: 'create' | 'edit' }) {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full md:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {mode === 'create' ? 'Creating...' : 'Saving...'}
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          {mode === 'create' ? 'Save Field' : 'Save Changes'}
        </>
      )}
    </Button>
  );
}

export function FieldForm({ mode, fieldAction, initialState, initialData = {}, schools }: FieldFormProps) {
  const [state, action] = useFormState(fieldAction, initialState);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [conditionRating, setConditionRating] = useState([initialData.surfaceConditionRating || 3]);
  const [isLocating, setIsLocating] = useState(false);
  const [fieldName, setFieldName] = useState(initialData.name || '');
  const [locationName, setLocationName] = useState(initialData.address || '');
  
  // Image URL Management
  const [imageUrls, setImageUrls] = useState<string[]>(initialData.images || []);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  const addImageUrl = () => {
    if (currentImageUrl && !imageUrls.includes(currentImageUrl)) {
      setImageUrls([...imageUrls, currentImageUrl]);
      setCurrentImageUrl('');
    }
  };

  const removeImageUrl = (url: string) => {
    setImageUrls(imageUrls.filter(u => u !== url));
  };
  
  // Geolocation logic
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        
        // Update inputs
        const coordsInput = document.getElementById('coordinates') as HTMLInputElement;
        const latInput = document.getElementById('latitude-hidden') as HTMLInputElement;
        const lngInput = document.getElementById('longitude-hidden') as HTMLInputElement;
        
        if (coordsInput) coordsInput.value = `${lat}, ${lng}`;
        if (latInput) latInput.value = lat;
        if (lngInput) lngInput.value = lng;
        
        setIsLocating(false);
        toast.success("Location updated successfully");
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMessage = "Failed to get location";
        switch(error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = "Location permission denied";
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = "Location information unavailable";
                break;
            case error.TIMEOUT:
                errorMessage = "Location request timed out";
                break;
        }
        toast.error(errorMessage);
        setIsLocating(false);
      }
    );
  };
  
  // Coordinate parsing logic
  const handleCoordinatesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parts = value.split(',').map(p => p.trim());
    
    const latInput = document.getElementById('latitude-hidden') as HTMLInputElement;
    const lngInput = document.getElementById('longitude-hidden') as HTMLInputElement;
    
    if (latInput && lngInput) {
      if (parts.length === 2 && !isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]))) {
        latInput.value = parts[0];
        lngInput.value = parts[1];
      } else {
        latInput.value = '';
        lngInput.value = '';
      }
    }
  };

  // Client-side validation
  const validateField = (name: string, value: string) => {
    try {
      const field = name as keyof typeof fieldSchema.shape;
      if (field in fieldSchema.shape) {
        // @ts-ignore - complex union type handling
        fieldSchema.shape[field].parse(value);
        setClientErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setClientErrors(prev => ({
          ...prev,
          [name]: (error as any).errors[0].message
        }));
      }
    }
  };

  const showSuccess = state.success;

  return (
    <form action={action} className="space-y-6">
      {/* Hidden input for image URLs (joined by comma or JSON) */}
      <input type="hidden" name="images" value={JSON.stringify(imageUrls)} />

      {showSuccess && (
        <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Field {mode === 'create' ? 'created' : 'updated'} successfully!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN - FORM */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {mode === 'create' ? 'Add New Field' : 'Edit Field'}
                </div>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter the details for the field or venue.
              </p>
            </CardHeader>
            
            <CardContent className="px-0">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-muted/20 p-1">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="surface">Surface</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                  <TabsTrigger value="staffing">Staffing</TabsTrigger>
                </TabsList>

                {/* DETAILS TAB */}
                <TabsContent value="details" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Field Name</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        defaultValue={initialData.name}
                        onChange={(e) => setFieldName(e.target.value)}
                        onBlur={(e) => validateField('name', e.target.value)}
                        placeholder="e.g. Main Oval"
                        className="bg-muted/10"
                      />
                      {(clientErrors.name || state.fieldErrors?.name) && (
                        <p className="text-sm text-destructive">{clientErrors.name || state.fieldErrors?.name[0]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="abbreviatedName">Alias (Optional)</Label>
                      <Input 
                        id="abbreviatedName" 
                        name="abbreviatedName" 
                        defaultValue={initialData.abbreviatedName}
                        placeholder="e.g. The Oval"
                        className="bg-muted/10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schoolId">Owning School (Optional)</Label>
                    <Select name="schoolId" defaultValue={initialData.schoolId || "none"}>
                      <SelectTrigger className="bg-muted/10">
                        <SelectValue placeholder="-- None (Independent Field) --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- None (Independent Field) --</SelectItem>
                        {schools.map(school => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Location / Address</Label>
                    <Input 
                      id="address" 
                      name="address" 
                      defaultValue={initialData.address}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="e.g. 123 Cricket Lane, Sportsville"
                      className="bg-muted/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="coordinates">Coordinates</Label>
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={handleUseCurrentLocation}
                            disabled={isLocating}
                        >
                            {isLocating ? (
                                <>
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    Locating...
                                </>
                            ) : (
                                <>
                                    <MapPin className="h-3 w-3 mr-1" />
                                    Use Current Location
                                </>
                            )}
                        </Button>
                    </div>
                    <Input 
                      id="coordinates" 
                      name="coordinates" 
                      defaultValue={initialData.coordinates ? `${initialData.coordinates.lat}, ${initialData.coordinates.lng}` : ''}
                      placeholder="-29.8247, 30.924"
                      className="bg-muted/10"
                      onChange={handleCoordinatesChange}
                    />
                    <p className="text-xs text-muted-foreground">Paste comma-separated latitude and longitude.</p>
                    {/* Hidden inputs to maintain compatibility with server action */}
                    <input type="hidden" name="latitude" id="latitude-hidden" defaultValue={initialData.coordinates?.lat} />
                    <input type="hidden" name="longitude" id="longitude-hidden" defaultValue={initialData.coordinates?.lng} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={initialData.status || "Available"}>
                      <SelectTrigger className="bg-muted/10">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Booked">Booked</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                {/* SURFACE TAB */}
                <TabsContent value="surface" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="pitchType">Pitch Type</Label>
                      <Select name="pitchType" defaultValue={initialData.pitchType || "Natural Turf"}>
                        <SelectTrigger className="bg-muted/10">
                          <SelectValue placeholder="Select Pitch Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Natural Turf">Natural Turf</SelectItem>
                          <SelectItem value="Drop-in Turf">Drop-in Turf</SelectItem>
                          <SelectItem value="Artificial Astro-Turf">Artificial Astro-Turf</SelectItem>
                          <SelectItem value="Matting Wicket">Matting Wicket</SelectItem>
                          <SelectItem value="Concrete Base">Concrete Base</SelectItem>
                          <SelectItem value="Indoor Synthetic">Indoor Synthetic</SelectItem>
                          <SelectItem value="Hybrid Reinforced">Hybrid Reinforced</SelectItem>
                          <SelectItem value="Drop-in Artificial">Drop-in Artificial</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fieldSize">Field Size</Label>
                      <Select name="fieldSize" defaultValue={initialData.fieldSize || "Full Size"}>
                        <SelectTrigger className="bg-muted/10">
                          <SelectValue placeholder="Select Size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full Size">Full Size</SelectItem>
                          <SelectItem value="Youth">Youth</SelectItem>
                          <SelectItem value="Training Area">Training Area</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Label>Overall Condition Rating: {conditionRating[0]}/5</Label>
                    </div>
                    <Slider 
                      defaultValue={[initialData.surfaceConditionRating || 3]} 
                      max={5} 
                      min={1} 
                      step={1} 
                      onValueChange={setConditionRating}
                      className="py-4"
                    />
                    <input type="hidden" name="surfaceConditionRating" value={conditionRating[0]} />
                  </div>

                  <Card className="bg-muted/10 border-none">
                    <CardContent className="p-4 space-y-4">
                      <h3 className="font-medium text-sm">Surface Details</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="grassCover">Grass Cover (%)</Label>
                        <Input 
                          id="grassCover" 
                          name="grassCover" 
                          type="number"
                          min="0"
                          max="100"
                          defaultValue={initialData.surfaceDetails?.grassCover || 90}
                          className="bg-background/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="moistureLevel">Moisture Level</Label>
                        <Select name="moistureLevel" defaultValue={initialData.surfaceDetails?.moistureLevel || "Normal"}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select moisture level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Dry">Dry</SelectItem>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="Wet">Wet</SelectItem>
                            <SelectItem value="Saturated">Saturated</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="firmness">Firmness</Label>
                        <Select name="firmness" defaultValue={initialData.surfaceDetails?.firmness || "Standard"}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select firmness" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Hard">Hard</SelectItem>
                            <SelectItem value="Standard">Standard</SelectItem>
                            <SelectItem value="Soft">Soft</SelectItem>
                            <SelectItem value="Dusty">Dusty</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <Label htmlFor="notes">General Notes</Label>
                    <Textarea 
                      id="notes" 
                      name="notes" 
                      defaultValue={initialData.notes}
                      placeholder="e.g. Excellent drainage, pitch plays fast."
                      className="bg-muted/10 min-h-[100px]"
                    />
                  </div>
                </TabsContent>

                {/* IMAGES TAB */}
                <TabsContent value="images" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Add Image URL</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={currentImageUrl}
                          onChange={(e) => setCurrentImageUrl(e.target.value)}
                          placeholder="https://example.com/field.jpg" 
                          className="bg-muted/10"
                        />
                        <Button type="button" onClick={addImageUrl} size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Add URLs for images of the field.
                      </p>
                    </div>

                    {/* Image List */}
                    {imageUrls.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={url} 
                              alt={`Field ${index + 1}`} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+Image';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeImageUrl(url)}
                              className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {imageUrls.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg text-muted-foreground">
                        <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">No images added yet</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* STAFFING TAB */}
                <TabsContent value="staffing" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input 
                        id="contactPerson" 
                        name="contactPerson" 
                        defaultValue={initialData.contactPerson}
                        placeholder="e.g. John Smith"
                        className="bg-muted/10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input 
                        id="contactPhone" 
                        name="contactPhone" 
                        defaultValue={initialData.contactPhone}
                        placeholder="e.g. 555-1234"
                        className="bg-muted/10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Assigned Grounds-Keepers</Label>
                    <p className="text-sm text-muted-foreground mb-2">Select the staff responsible for this field.</p>
                    
                    <div className="border rounded-md p-4 bg-muted/5 space-y-2 max-h-[200px] overflow-y-auto">
                      {/* Mock Staff List for now - in real app, fetch from 'people' collection */}
                      <div className="flex items-center space-x-2 p-2 hover:bg-muted/10 rounded-md">
                        <Checkbox id="staff-1" name="groundsKeeperIds" value="kameel-kalyan" />
                        <Label htmlFor="staff-1" className="flex items-center gap-2 cursor-pointer font-normal w-full">
                          <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center text-xs text-white">KK</div>
                          Kameel Kalyan
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 hover:bg-muted/10 rounded-md">
                        <Checkbox id="staff-2" name="groundsKeeperIds" value="john-doe" />
                        <Label htmlFor="staff-2" className="flex items-center gap-2 cursor-pointer font-normal w-full">
                          <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white">JD</div>
                          John Doe
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 hover:bg-muted/10 rounded-md">
                        <Checkbox id="staff-3" name="groundsKeeperIds" value="jane-smith" />
                        <Label htmlFor="staff-3" className="flex items-center gap-2 cursor-pointer font-normal w-full">
                          <div className="h-6 w-6 rounded-full bg-amber-600 flex items-center justify-center text-xs text-white">JS</div>
                          Jane Smith
                        </Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {state.error && (
                <Alert variant="destructive" className="mt-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-end gap-2 px-0 pt-6">
              <Button variant="outline" type="button" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <SubmitButton mode={mode} />
            </CardFooter>
          </Card>
        </div>

        {/* RIGHT COLUMN - CONTEXT */}
        <div className="space-y-6">
          {/* Weather Widget */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
              Weather Forecast
            </h3>
            <WeatherWidget 
              date={new Date().toISOString()} 
              location={locationName || fieldName || 'Durban'} 
            />
          </div>

          {/* Gallery Preview (Sidebar) */}
          {imageUrls.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Gallery Preview
              </h3>
              <Card>
                <CardContent className="p-0 overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={imageUrls[0]} 
                    alt="Main Preview" 
                    className="w-full h-48 object-cover"
                  />
                  {imageUrls.length > 1 && (
                    <div className="grid grid-cols-3 gap-1 p-1 bg-muted">
                      {imageUrls.slice(1, 4).map((url, i) => (
                        <div key={i} className="aspect-square relative overflow-hidden rounded-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
