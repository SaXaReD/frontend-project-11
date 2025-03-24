/* eslint-disable no-param-reassign */

const renderStatus = (processState, elements, i18n) => {
  switch (processState) {
    case 'processing':
      elements.input.readOnly = true;
      elements.button.disabled = true;
      elements.button.innerHTML = '';
      elements.spanSpinner.setAttribute('role', 'status');
      elements.spanSpinner.setAttribute('aria-hidden', 'true');
      elements.button.append(elements.spanSpinner);
      elements.spanLoading.classList.add('sr-only');
      elements.spanLoading.textContent = '  Загрузка...';
      elements.button.append(elements.spanLoading);
      elements.input.classList.remove('is-invalid');
      break;
    case 'success':
      elements.input.readOnly = false;
      elements.button.disabled = false;
      elements.button.innerHTML = '';
      elements.button.textContent = 'Добавить';
      elements.form.reset();
      elements.form.focus();
      elements.feedbackContainer.classList.remove('text-danger');
      elements.feedbackContainer.classList.add('text-success');
      elements.feedbackContainer.textContent = i18n.t('form.success');
      break;
    case 'failed':
      elements.input.readOnly = false;
      elements.button.disabled = false;
      elements.button.innerHTML = '';
      elements.button.textContent = 'Добавить';
      elements.input.classList.add('is-invalid');
      break;
    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

export default renderStatus;
