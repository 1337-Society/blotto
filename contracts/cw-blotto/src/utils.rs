use std::cmp::{Ord, Ordering};

pub fn find_max_with_duplicates<T, I, F, K>(iter: I, mut key_extractor: F) -> Option<(T, bool)>
where
    T: Clone,
    I: Iterator<Item = T>,
    F: FnMut(&T) -> K,
    K: Ord,
{
    let mut max_item = None;
    let mut max_key = None;
    let mut count = 0;

    for item in iter {
        let key = key_extractor(&item);
        match max_key.as_ref() {
            Some(current_max) => match key.cmp(current_max) {
                Ordering::Greater => {
                    max_key = Some(key);
                    max_item = Some(item.clone());
                    count = 1;
                }
                Ordering::Equal => {
                    count += 1;
                }
                Ordering::Less => {}
            },
            None => {
                max_key = Some(key);
                max_item = Some(item.clone());
                count = 1;
            }
        }
    }

    max_item.map(|item| (item, count > 1))
}
