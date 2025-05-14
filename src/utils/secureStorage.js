import SecureStorage from 'cordova-plugin-secure-storage-echo';

export const saveSecureSetting = async (key, value) => {
  return new Promise((resolve, reject) => {
    new SecureStorage(
      (storage) => storage.set(
        () => resolve(true),
        (err) => reject(err),
        key,
        JSON.stringify(value)
      ),
      (err) => reject(err),
      'muzima_settings'
    );
  });
};

export const loadSecureSetting = async (key) => {
    return new Promise((resolve, reject) => {
      new SecureStorage(
        (storage) => {
          storage.get(
            (value) => resolve(JSON.parse(value)),
            (err) => {
              if (err.code === 2) resolve(null); // Not found
              else reject(err);
            },
            key
          );
        },
        (err) => reject(err),
        'muzima_settings'
      );
    });
  };
  
