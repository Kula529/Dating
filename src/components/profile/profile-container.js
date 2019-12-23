import axios from 'axios';
import { useState } from 'react';
import _ from 'lodash';
import { toast } from 'react-toastify';

// import { AuthContext } from '../app/AuthContext';
let newInput;
let newChangedFields;

const UseProfileForm = (userData, token) => {
  const [profile, setProfile] = useState({});
  const [changedFields, setChangedFields] = useState({});

  if (_.isEmpty(profile))
    userData.then(data => {
      setProfile(data.data);
    });

  const handleTextParametersChange = event => {
    newInput = {
      ...profile,
      [event.target.name]: event.target.value,
    };
    newChangedFields = {
      ...changedFields,
      [event.target.name]: event.target.value,
    };
  };

  const isChecked = (fieldId, type) => {
    if (type === 'gender' && profile.gender) {
      const isCkecked = ('includes', profile.gender.includes(fieldId));
      return isCkecked;
    }
    if (type === 'sexualOrientation' && profile.sexualOrientation) {
      const isCkecked =
        ('includes', profile.sexualOrientation.includes(fieldId));
      return isCkecked;
    }
    return false;
  };

  const handleNotifChange = event => {
    newInput = {
      ...profile,
      [event.target.name]: event.target.checked,
    };
    newChangedFields = {
      ...changedFields,
      [event.target.name]: event.target.checked,
    };
  };

  const handleSexualOrientationChange = event => {
    const checkboxValue = parseInt(event.target.value, 10);
    if (event.target.checked === true) {
      profile.sexualOrientation.push(checkboxValue);
      profile.sexualOrientation.sort();
    } else {
      const index = profile.sexualOrientation.indexOf(checkboxValue);
      if (index > -1) {
        profile.sexualOrientation.splice(index, 1);
      }
    }
    newInput = {
      ...profile,
      [event.target.name]: profile.sexualOrientation,
    };
    newChangedFields = {
      ...changedFields,
      [event.target.name]: profile.sexualOrientation,
    };
  };

  const handleSummaryChange = event => {
    newInput = {
      ...profile,
      [event.target.name]: event.target.value,
    };
    newChangedFields = {
      ...changedFields,
      [event.target.name]: event.target.value,
    };
  };

  const handleGenderChange = event => {
    const checkboxValue = parseInt(event.target.value, 10);
    if (event.target.checked === true) {
      profile.gender.push(checkboxValue);
      profile.gender.sort();
    } else {
      const index = profile.gender.indexOf(checkboxValue);
      if (index > -1) {
        profile.gender.splice(index, 1);
      }
    }
    newInput = {
      ...profile,
      [event.target.name]: profile.gender,
    };
    newChangedFields = {
      ...changedFields,
      [event.target.name]: profile.gender,
    };
  };

  const handleProfileChange = event => {
    event.persist();

    if (event.target.type !== 'checkbox') {
      if (event.target.name === 'description') {
        handleSummaryChange(event);
      } else {
        handleTextParametersChange(event);
      }
    } else {
      if (event.target.name === 'gender') {
        handleGenderChange(event);
      }
      if (event.target.name === 'notificationMail') {
        handleNotifChange(event);
      }
      if (event.target.name === 'sexualOrientation') {
        handleSexualOrientationChange(event);
      }
    }

    setProfile(newInput);
    setChangedFields(newChangedFields);
    console.log('newInput :', newInput);
    console.log('changed :', newChangedFields);
  };

  const handleSubmitParameters = event => {
    event.persist();
    if (_.isEmpty(changedFields)) {
      toast.error("You didn't make any changes!");
    } else if (event) {
      event.preventDefault();
      axios
        .put('http://localhost:3001/users', changedFields, {
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'x-access-token': token,
          },
        })
        .then(response => {
          if (response.data.success === true) {
            toast.success(response.data.message);
            setChangedFields({});
          } else {
            console.log(response);
            response.data.errors.forEach(error => {
              toast.error(error);
            });
          }
        });
    }
  };

  const handleFileUpload = event => {
    const formData = new FormData();
    console.log(event.target.files[0]);
    formData.append('file', event.target.files[0]);
    axios
      .post(`http://localhost:3001/images/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-access-token': token,
        },
      })
      .then(response => {
        console.log(response);
        if (profile.profilePicture === null) {
          const newInput = {
            ...profile,
            images: [...profile.images, response.data.Location],
            profilePicture: response.data.Location,
          };
          setProfile(newInput);
        } else {
          const newInput = {
            ...profile,
            images: [...profile.images, response.data.Location],
          };
          setProfile(newInput);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  const handleDeleteImage = url => {
    axios
      .post(
        `http://localhost:3001/images/delete`,
        { url },
        {
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'x-access-token': token,
          },
        },
      )
      .then(response => {
        if (response.data.success === true) {
          if (url === profile.profilePicture) {
            const newInput = {
              ...profile,
              images: _.without(profile.images, url),
              profilePicture:
                _.without(profile.images, url)[0] ||
                'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png',
            };
            setProfile(newInput);
          } else {
            const newInput = {
              ...profile,
              images: _.without(profile.images, url),
            };
            setProfile(newInput);
          }
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  const handleChangeProfileImage = pictureUrl => {
    const newInput = {
      ...profile,
      profilePicture: pictureUrl,
    };
    const newChangedFields = {
      ...changedFields,
      profilePicture: pictureUrl,
    };
    setProfile(newInput);
    setChangedFields(newChangedFields);
  };

    const handleChangeLocation = newLocation => {
    const newInput = {
      ...profile,
      location: newLocation,
    };
    const newChangedFields = {
      ...changedFields,
      location: newLocation,
    };
    setProfile(newInput);
    setChangedFields(newChangedFields);
  };

  return {
    handleFileUpload,
    handleDeleteImage,
    handleProfileChange,
    handleSexualOrientationChange,
    handleSummaryChange,
    profile,
    handleChangeProfileImage,
    handleChangeLocation,
    handleSubmitParameters,
    isChecked,
  };
};

export default UseProfileForm;
