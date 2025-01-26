import * as yup from 'yup';
import onChange from 'on-change';

export default () => {
  const initialState = {
    url: [],
    isValid: true,
    error: '',
  };

  const form = document.querySelector('.rss-form');
  const inputField = document.querySelector('#url-input');
  const feedbackElement = document.querySelector('.feedback');

  const watchedState = onChange(initialState, () => {
    if (watchedState.isValid) {
      feedbackElement.textContent = 'RSS успешно загружен';
      feedbackElement.classList.replace('text-danger', 'text-success');
      inputField.classList.remove('is-invalid');
      inputField.focus();
      inputField.value = '';
    } else {
      feedbackElement.textContent = watchedState.error;
      feedbackElement.classList.replace('text-success', 'text-danger');
      inputField.classList.add('is-invalid');
    }
  });

  const schema = yup.string().required()
    .url('Ссылка должна быть валидным URL')
    .test('is-unique', 'RSS уже существует', (value) => !watchedState.url.includes(value));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const url = formData.get('url');
    try {
      await schema.validate(url);
      watchedState.isValid = true;
      watchedState.url.push(url);
    } catch (error) {
      watchedState.isValid = false;
      watchedState.error = error.message;
    }
  });
};
