import * as yup from 'yup';

export default (url, urlList) => {
  yup.setLocale({
    mixed: {
      required: 'form.errors.required',
      notOneOf: 'form.errors.existingUrl',
    },
    string: {
      url: 'form.errors.invalidUrl',
    },
  });

  const schema = yup
    .string()
    .required()
    .url()
    .notOneOf(urlList);

  return schema.validate(url);
};
