document.addEventListener('DOMContentLoaded', function () {
  // Feather icon init
  feather.replace();

  // Social Link Add/Remove
  const addLinkBtn = document.getElementById('add-link-btn');
  const linkContainer = document.getElementById('social-links');

  if (addLinkBtn && linkContainer) {
    addLinkBtn.addEventListener('click', function () {
      const newInputGroup = document.createElement('div');
      newInputGroup.classList.add('input-group', 'mb-2');
      newInputGroup.innerHTML = `
        <input type="url" class="form-control rounded-start-3" placeholder="https://...">
        <button type="button" class="btn btn-outline-danger rounded-end-3 remove-link-btn">
          <i data-feather="x-circle" class="fs-5"></i>
        </button>
      `;
      linkContainer.appendChild(newInputGroup);
      feather.replace(); // re-render icons
    });

    linkContainer.addEventListener('click', function (e) {
      if (e.target.closest('.remove-link-btn')) {
        e.target.closest('.input-group').remove();
      }
    });
  }

  // Profile Image Upload & Preview
  const imageInput = document.getElementById('profileImageInput');
  const overlay = document.querySelector('.upload-overlay');
  const preview = document.getElementById('profileImagePreview');

  if (imageInput && overlay && preview) {
    overlay.addEventListener('click', () => imageInput.click());

    imageInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    preview.style.backgroundImage = `url(${e.target.result})`;
                    preview.style.backgroundSize = 'cover';
                    preview.style.backgroundPosition = 'center';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Form Submission
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            try {
                const response = await fetch('/Profile/UpdateProfile', {
                    method: 'POST',
                    body: formData // Send FormData to handle file uploads
                });
                const result = await response.json();
                if (result.success) {
                    alert('Profile updated successfully');
                    // Update UI
                    document.getElementById('currentUserName').textContent = formData.get('displayName');
                    // Update username in the UI
                    const usernameElement = document.querySelector('.text-muted');
                    if (usernameElement) {
                        usernameElement.textContent = '@' + formData.get('username');
                    }
                    // Close modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
                    modal.hide();
                    // Reload page if profile image was updated
                    if (formData.get('profileImage').size > 0) {
                        location.reload();
                    }
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                alert('An error occurred while updating the profile.');
            }
        });
    }
});