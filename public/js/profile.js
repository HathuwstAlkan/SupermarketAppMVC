document.addEventListener('DOMContentLoaded', function(){
  const avatarInput = document.getElementById('avatarInput');
  const avatarForm = document.getElementById('avatarForm');
  const profileAvatar = document.getElementById('profileAvatar');

  if (!avatarInput || !avatarForm) return;

  document.querySelectorAll('.avatar-edit').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      avatarInput.click();
    });
  });

  avatarInput.addEventListener('change', function(){
    if (avatarInput.files && avatarInput.files[0]) {
      // show preview
      const reader = new FileReader();
      reader.onload = function(e){
        profileAvatar.src = e.target.result;
      };
      reader.readAsDataURL(avatarInput.files[0]);
      // auto submit the avatar form
      avatarForm.submit();
    }
  });
});
