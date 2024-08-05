# ProjectTwo

![Intro Page](/app%20cover.png)

## About my app:

Title: Whats For Lunch?

Concept:
I believe that there are days where you find it hard to make a decision what to eat, I sure do. So I decided to make this app for my project to help me choose what to eat based on some pre-formed choices. With that said, WHATS FOR LUNCH? is born

How it works:

1. Choose to create a new profile or see from a list of existing profiles
2. If chosen to create a new profile, users will be brought to the Profile Form and the user will be able to select any dietary restrictions.
3. The user will now see the list of profiles and is able to choose one
4. Upon selecting, Google map api will request for the user's current location and a list of 3 FnB within 1km of the user will be shown
5. User will be able set price point to further refine the search
6. User can see details about the fnb and also directions
7. Google Map API will populate and update the map accordingly

Main goal (MVP):

1. Create a simple react app with Airtable as my database of profiles
2. Allow user to create a profile and choose from a fixed list of dietary restrictions
3. Using Google Map API to call upon the profiles from Airtable to plot and suggest 3 fnb options within 1 km of the user.

Stretch goal:

1. Allow users to choose mode of travel and a brief direction information on the map
2. Allow user to further sort the list of fnb by price

Future goals (Maybe):

1. Instead of hard coding my restrictions, I wanted to make a 2nd table in Airtable to house them. However, I keep getting issues juggling two different tables so I decided to put it aside
2. Making the map even more interactive

## IN THE BENINGING

![Wireframe](</GA Project 2 - V1 (mpv_).png>)

As you may notice, the wireframe has allergies options. Welp, read on later to find out what hapepned.

## Creation Process

1.  Planning

    1. What I wanted the app to do such as allow users to mark out their dietary restrictions and allergies
    2. Test the app using local storage first
    3. Create airtable to store the profile forn data
    4. Get Airtable to help populate the Google Maps API

2.  Forms and Viewing

    Generally, creating the form was pretty basic at the start since I didn't need to care about any API or whatsoever. I started by planning out the compnents needed, here is how it looked

    - src/
    - |-- components/
    - | |-- ProfileForm.jsx
    - | |-- ProfileForm.module.css
    - | |-- EditProfileModal.jsx
    - | |-- CheckboxGroup.jsx
    - | |-- CheckboxGroup.module.css
    - | |-- ProfileView.jsx
    - | |-- ProfileView.module.css
    - |-- pages/
    - | |-- HomePage.jsx
    - | |-- HomePage.module.css
    - |-- App.jsx
    - |-- index.jsx

    **5 components checked!**

    Using notes from the lessons, I actually created a pages folder (which I actually necer really use)

    I also went and plotted out Food Allergies and Dietary Restrictions as follow, only to find out that it is not what I want but what Google can give me.... SO MUCH TIME WASTED

    ```
    <h3>Allergies</h3>
       <CheckboxGroup
         options={[
           "Nuts",
           "Crustaceans",
           "Gluten",
           "Mushrooms",
           "Dairy",
           "Eggs",
           "Soy",
         ]}
         selectedOptions={allergies}
         onChange={(option, checked) => {
           setAllergies((prevAllergies) =>
             checked
               ? [...prevAllergies, option]
               : prevAllergies.filter((a) => a !== option)
           );
         }}
       />
       <h3>Dietary Restrictions</h3>
       <CheckboxGroup
         options={[
           "Halal",
           "Kosher",
           "Keto",
           "Vegan",
           "Vegetarian",
           "Pescatarian",
           "Hindu/Buddhist",
         ]}
         selectedOptions={restrictions}
         onChange={(option, checked) => {
           setRestrictions((prevRestrictions) =>
             checked
               ? [...prevRestrictions, option]
               : prevRestrictions.filter((r) => r !== option)
           );
         }}
       />
    ```

    Profile view itself was harder to do and really took a lot out of me but hey! **2 useState done!**

    ```
    const ProfileView = () => {
    const [profiles, setProfiles] = useState([]);
    const [editingProfile, setEditingProfile] = useState(null);
    const [selectedProfiles, setSelectedProfiles] = useState([]);
    ```

3.  Routing- The easiest thing

    NOTHING, I REALLY MEAN, NOTHING WAS EASIER THAN ROUTING. I had Form, Profile and was also considering Maps to be a different page. Therefore **2 Routes completed!**

    ````
    import React from "react";
    import { Route, Routes, Navigate } from "react-router-dom"; // Import Route, Routes, and Navigate from react-router-dom
    import ProfileForm from "./components/ProfileForm";
    import ProfileView from "./components/ProfileView";

        const App = () => {
        return (
            <Routes>
            <Route path="/" element={<ProfileForm />} />
            <Route path="/profiles" element={<ProfileView />} />
            <Route path="*" element={<Navigate to="/" />} />{" "}
            {/* Redirect to "/" for unknown routes */}
            </Routes>
        );
        };

        export default App;
        ```


    ````

4.  Props (to you)

    While I honestly did not count any of the things such as props, lifiting and routes before I started writing this ReadMe, I am glad to say that in the full complete code, I have 4 props

    **Prop 1: Profile View**

    Component: ProfileList
    Props:

    - profiles: An array of profile objects containing details such as name, email, and id.
    - selectedProfile: The currently selected profile object.
    - onProfileClick: Function to handle click events on a profile item.

    ```
    <ProfileView
    profiles={profiles}
    selectedProfile={selectedProfile}
    onProfileClick={handleProfileClick}
    />
    ```

    Usage Explanation:

    - profiles: This prop is passed down to ProfileView in this case to render a list of profile items.
    - selectedProfile: Allows ProfileView to highlight or apply specific styles to the currently selected profile item in the list.
    - onProfileClick: This function (handleProfileClick) is passed as a prop to ProfileView and is invoked when a profile item is clicked. It updates the state (selectedProfile) to reflect the currently selected profile.

    **Prop 2: Modal**

    Component: Modal
    Props:

    - onClose: Function to handle modal close event.
    - children: React elements to render inside the modal (e.g., place details).

    ```
    <Modal onClose={closeModal}>
          <h2>{selectedPlace.name}</h2>
          <p>{selectedPlace.formatted_address}</p>
          {selectedPlace.formatted_phone_number && (
            <p>Phone: {selectedPlace.formatted_phone_number}</p>
          )}....

    const Modal = ({ onClose, children }) => {
    const modalRef = useRef(null);
    ...
    return (
    <div className={styles.modalBackdrop}>
      <div
        ref={modalRef}
        className={styles.modalContent}
        onClick={handleModalClick}
      >
        {children}
      </div>
    </div>
    );
    ```

    Usage Explanation:

    - onClose: This prop (closeModal) is a function that is triggered when the user wants to close the modal.
    - children: React components or elements passed as children to Modal.

    **Prop 3: Maps**

    Component: Maps

    Props:

    - restrictions: An array of strings representing search restrictions for places.
    - selectedPriceLevel: The selected price level for filtering places.
    - handlePriceLevelChange: Function to handle changes in the price level selection.

    ```
    <Maps
    restrictions={restrictions}
    selectedPriceLevel={selectedPriceLevel}
    handlePriceLevelChange={handlePriceLevelChange}
    />
    ```

    Usage Explanation:

    - restrictions: Passed to Maps, this prop (restrictions) contains search criteria (strings) that define what types of places to search for on the map (e.g., restaurants, parks).
    - selectedPriceLevel: Represents the current selected price level for filtering places on the map.
    - handlePriceLevelChange: This function (handlePriceLevelChange) is used within Maps to update the state (selectedPriceLevel) when the user changes the price level filter. It typically triggers a re-fetch or re-render of places based on the new filter.

    **Prop 4: Place Item**

    Component: PlaceItem (inside Maps)

    Props:

    - place: Object containing details of a place, such as name, address, and place id.
    - calculateAndDisplayRoute: Function to calculate and display directions to the place.

    ```
    {places.map((place) => (
    <PlaceItem
        key={place.place_id}
        place={place}
        calculateAndDisplayRoute={calculateAndDisplayRoute}
    />
    ))}

    ```

    Usage Explanation:

    - place: Each PlaceItem component receives a place object as a prop, which contains details (e.g., name, address) of a specific place fetched from Google Maps API.
    - calculateAndDisplayRoute: This function (calculateAndDisplayRoute) is passed down to PlaceItem and is invoked when the user interacts with a place (e.g., clicks "Get Directions"). It calculates and displays the route from the current location to the selected place on the map.

    Yes I am lame, it is not 4 props but 4 components where each of them has like 2 or more props ha ha ha....

5.  CUD the curd

    I was pleasntly surprise that CUD-ing was not as hard as what I had to do during assement. I guess I just hate exams.. Well there, heres my pretty pretty CUDs

        **CREATE**
        ```
        const createRecord = async (data) => {

        try {
        const res = await airtableAxios.post("/", { fields: data });
        return res.data;
        } catch (error) {
        console.error("Error creating record:", error);
        throw error;
        }
        };
        ```
        ```
        const handleSubmit = async (event) => {
        event.preventDefault();

        const profile = {
        Profiles: profiles,
        Restrictions: restrictions,
        };

        try {
        let response;
        if (location && location.state && location.state.profile) {
            const { id } = location.state.profile;
            response = await airtableServices.updateRecord(id, profile);
        } else {
            response = await airtableServices.createRecord(profile);
        }

        console.log("Profile saved successfully:", response);
        navigate("/profiles");
        } catch (error) {
        console.error("Error saving profile:", error);
        }
        };
        ```
        **UPDATE**
        ```
        const updateRecord = async (records) => {
        try {
            const res = await airtableAxios.patch("/", { records });
            console.log("Update response:", res.data); // Log successful response for debugging
            return res.data;
        } catch (error) {
            console.error("Error updating record:", error);
            throw error;
        }
        };
        ```
        ```
        const handleEditProfile = (profile) => {
        setSelectedProfile(profile);
        setIsModalOpen(true);

        };

        const handleSaveProfile = async (editedProfile) => {
        try {
        const updatedProfile = {
        profiles: editedProfile.profiles,
        restrictions: editedProfile.restrictions || [],
        };

            await airtableServices.updateRecord(selectedProfile.id, updatedProfile);

            setIsModalOpen(false);
            setSelectedProfile(null);
            console.log("Profile updated successfully");
            fetchProfiles();
            } catch (error) {
            console.error("Error updating profile:", error);
            }

        };

        ```

        **DELETE**

        ```
        const deleteRecord = async (recordId) => {
        try {
        const res = await airtableAxios.delete(`/${recordId}`);
        return res.data;
        } catch (error) {
        console.error("Error deleting record:", error);
        throw error;
        }
        };

        ```

        ```

        const handleDeleteProfile = async (profileId) => {
        try {
        await airtableServices.deleteRecord(profileId);
        console.log("Profile deleted successfully");
        fetchProfiles();
        if (selectedProfile && selectedProfile.id === profileId) {
        setSelectedProfile(null);
        }
        } catch (error) {
        console.error("Error deleting profile:", error);
        }
        };

        ```

    Cud, Crud, its everywhere. Profile from, view, map

## Pains and Suffering

1. Problems with my planning

   As shared above... generally, there are no maps in the world that has the filter for allergies, or perhaps I did not dig hard enough, nevertheless. I realized that my classmates did the right move by messing around with their APIS first before anything else.

2. Pains of Airtable

   Delete... my delete works and Airtable reflects so but I still get patch errors from time to time..

   Fields... either you cannot call a field from a table but I am pretty sure it is just me, though I found out that you can always create a 2nd table. What is this about? This links back to the Restrictions table I spoke about earlier.

3. Pains of Google Map API

   New VS Old. My goodness this Gmap, theres always something clashing between old and new codes or assets which causes unsightly notices in your console. Heres a list of what I hate the most

   - Loading = async: Always telling me my map is not loading async until I realized I need to use their damn loader
   - Marker: Always telling me to use AdvanceMarkerElement but do not tell me how to properly implement it. Then once I managed, my blood marker goes bye bye. RAGGGGHHHH
   - G maps only knows YES: What I am trying to say is, you can only search using the "yes" concept. E.g; YES to VEGAN = OK . NO to prawns = NOT OK.

## Likes and learning points

I dunno...
